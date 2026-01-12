import { PROCESS_DOC } from "./lib/constants";
import type { Msg, SentenceData } from "./lib/types";
import highlightElements from "./scripts/highlightElements";
import getPageContent from "./scripts/getPageContent";
import { isSentenceData } from "./lib";

const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

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

let offscreenTimeout: NodeJS.Timeout | null = null;

const closeOffscreenDocument = async (): Promise<void> => {
  if (offscreenTimeout) {
    clearTimeout(offscreenTimeout);
  }

  offscreenTimeout = setTimeout(() => {
    chrome.offscreen.closeDocument();
    offscreenTimeout = null;
  }, 10000);
};

const setupOffscreenDocument = async () => {
  if (offscreenTimeout) clearTimeout(offscreenTimeout);

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

  if (typeof pageContentResult !== "string") {
    await updateBadge(tabId, "error", "Failed to get page content");
    return;
  }

  await setupOffscreenDocument();

  const { data: processDocData } = await chrome.runtime.sendMessage({
    type: PROCESS_DOC,
    target: "offscreen",
    data: pageContentResult,
  });

  if (!isSentenceData(processDocData)) {
    await updateBadge(tabId, "error", "Failed to process document");
    return;
  }

  const [{ result: highlightCompleteResult }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: highlightElements,
    args: [processDocData],
  });

  if (typeof highlightCompleteResult !== "string") {
    await updateBadge(tabId, "error", "Failed to highlight elements");
  }

  await closeOffscreenDocument();
};

chrome.action.onClicked.addListener(onClicked);
