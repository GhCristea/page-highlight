import { PROCESS_DOC, OFFSCREEN, BACKGROUND } from "./lib/constants";
import highlightElements from "./scripts/highlightElements";
import getPageContent from "./scripts/getPageContent";
import { Msg } from "./lib/types";
import { isString } from "./lib";

const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

type MsgIn = Msg<typeof OFFSCREEN>;
type MsgOut = Msg<typeof BACKGROUND>;

type Variant = "error" | "pending";

const updateBadge = async (tabId: number, variant: Variant, title: string) => {
  await chrome.action.disable(tabId);
  await chrome.action.setTitle({ tabId, title });

  if (variant === "error") {
    console.error(title);
    await chrome.action.setBadgeBackgroundColor({ tabId, color: [255, 0, 0, 255] });
    await chrome.action.setBadgeText({ tabId, text: "X" });
  }
};

let activeRequests = 0;
let offscreenTimeout: NodeJS.Timeout | null = null;

const OFFSCREEN_TIMEOUT = 1000;

const teardownOffscreenDocument = async () => {
  activeRequests--;

  if (activeRequests <= 0) {
    if (offscreenTimeout) {
      clearTimeout(offscreenTimeout);
    }

    offscreenTimeout = setTimeout(() => {
      if (activeRequests <= 0) {
        chrome.offscreen.closeDocument();
        offscreenTimeout = null;
      }
    }, OFFSCREEN_TIMEOUT);
  }
};

const setupOffscreenDocument = async () => {
  activeRequests++;

  if (offscreenTimeout) {
    clearTimeout(offscreenTimeout);
    offscreenTimeout = null;
  }

  if (!(await hasDocument())) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: "Parse DOM and run NLP processing",
    });
  }
};

const hasDocument = async (): Promise<boolean> => {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  const matchedClients = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl],
  });

  return matchedClients.some((client) =>
    client.documentUrl?.endsWith(OFFSCREEN_DOCUMENT_PATH)
  );
};

const onClicked = async (tab: chrome.tabs.Tab): Promise<void> => {
  const tabId = tab.id;

  if (!tabId) {
    console.log("No tab ID found");
    await chrome.action.disable();
    return;
  }

  if (tab.status !== "complete") {
    await updateBadge(tabId, "pending", "Tab is not ready");
    return;
  }

  if (!tab.url || tab.url.includes("chrome://")) {
    await updateBadge(tabId, "error", "Not available on this page");
    return;
  }

  const [{ result: pageContentResult }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: getPageContent,
  });

  if (!pageContentResult) {
    await updateBadge(tabId, "error", "Failed to get page content");
    return;
  }

  await setupOffscreenDocument();

  if (!(await hasDocument())) {
    await updateBadge(tabId, "error", "Offscreen document not ready");
    await teardownOffscreenDocument();
    return;
  }

  let relevantTxt: MsgIn["data"] = null;
  let error: unknown = null;

  try {
    const response = await chrome.runtime.sendMessage<MsgOut, MsgIn>({
      type: PROCESS_DOC,
      data: pageContentResult,
    });

    if (chrome.runtime.lastError) {
      error = chrome.runtime.lastError.message || null;
    } else if (response) {
      relevantTxt = response.data;
      error = response.error;
    } else {
      error = "No response from offscreen document";
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Communication error";
  }

  if (!relevantTxt) {
    await updateBadge(tabId, "error", isString(error) ? error : "Failed to process document");
    await teardownOffscreenDocument();
    return;
  }

  const [{ result: highlightCompleteResult }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: highlightElements,
    args: [relevantTxt],
  });

  if (!Array.isArray(highlightCompleteResult)) {
    await updateBadge(tabId, "error", "Failed to highlight elements");
  }

  console.log(highlightCompleteResult);

  await teardownOffscreenDocument();
};

chrome.action.onClicked.addListener(onClicked);
