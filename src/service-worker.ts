import { PROCESS_DOC } from "./lib/constants";
import type { Msg } from "./lib/types";
import highlightElements from "./scripts/highlightElements";
import getPageContent from "./scripts/getPageContent";
const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

type Variant = "error" | "pending";

const updateBadge = async (tabId: number, variant: Variant, title: string) => {
  await chrome.action.disable(tabId);
  await chrome.action.setTitle({ tabId, title });

  if (variant === "error") {
    await chrome.action.setBadgeBackgroundColor({ tabId, color: [255, 0, 0, 255] });
    await chrome.action.setBadgeText({ tabId, text: "X" });
  }
};

const closeOffscreenDocument = async (): Promise<void> => {
  if (!(await hasDocument())) {
    console.log("No offscreen document found");
    return;
  }
  await chrome.offscreen.closeDocument();
  console.log("Offscreen document closed");
};

const hasDocument = async (): Promise<boolean> => {
  const matchedClients = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
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
    console.log("Not available on this page");
    await updateBadge(tabId, "error", "Not available on this page");
    return;
  }
  const [{ result: pageContentResult }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: getPageContent,
  });

  if (!pageContentResult || typeof pageContentResult !== "string") {
    console.error("Failed to get page content", pageContentResult);
    await updateBadge(tabId, "error", "Failed to get page content");
    return;
  }

  if (!(await hasDocument())) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: "Parse DOM and run NLP processing",
    });
  }

  const { data: processDocData } = await chrome.runtime.sendMessage<Msg>({
    type: PROCESS_DOC,
    target: "offscreen",
    data: pageContentResult,
  });

  if (!processDocData || typeof processDocData !== "string") {
    console.error("Failed to process document", processDocData);
    await updateBadge(tabId, "error", "Failed to process document");
    return;
  }

  const [{ result: highlightCompleteResult }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: highlightElements,
    args: [processDocData],
  });

  if (!highlightCompleteResult || typeof highlightCompleteResult !== "string") {
    console.error("Failed to highlight elements", highlightCompleteResult);
    await updateBadge(tabId, "error", "Failed to highlight elements");
  }

  await closeOffscreenDocument();
};

chrome.action.onClicked.addListener(onClicked);
