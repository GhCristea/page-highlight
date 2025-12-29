import { getMsgHeader, validMsg } from "./lib";
import { REQ_DOC_HTML, HIGHLIGHT_COMPLETE, REL_TEXT_RES } from "./lib/constants";

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

async function closeOffscreenDocument() {
  if (!(await hasDocument())) {
    console.log("No offscreen document found");
    return;
  }
  await chrome.offscreen.closeDocument();
  console.log("Offscreen document closed");
}

async function hasDocument() {
  const matchedClients = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });

  return matchedClients.some((client) =>
    client.documentUrl?.endsWith(OFFSCREEN_DOCUMENT_PATH)
  );
}

chrome.action.onClicked.addListener(async (tab) => {
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

  if (tab.url?.includes("chrome://")) {
    console.log("Not available on this page");
    await updateBadge(tabId, "error", "Not available on this page");
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.bundle.js"],
  });

  if (!(await hasDocument())) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: "Parse DOM and run NLP processing",
    });
  }

  try {
    await chrome.tabs.sendMessage(tabId, getMsgHeader(REQ_DOC_HTML));
  } catch (error) {
    console.error("Failed to send message to content script:", error);
    await updateBadge(tabId, "error", "Failed to communicate with page");
    await closeOffscreenDocument();
  }
});

chrome.runtime.onMessage.addListener(async (message) => {
  if (!message?.type || ![HIGHLIGHT_COMPLETE, REL_TEXT_RES].includes(message?.type)) {
    return false;
  }

  switch (message.type) {
    case HIGHLIGHT_COMPLETE: {
      if (!validMsg(message, HIGHLIGHT_COMPLETE)) {
        console.log("Invalid message received", HIGHLIGHT_COMPLETE, message);
        return false;
      }

      if (message.error) {
        console.error("Highlight error:", message.error);
      }

      break;
    }

    case REL_TEXT_RES: {
      if (!validMsg(message, REL_TEXT_RES)) {
        console.log("Invalid message received", REL_TEXT_RES, message);
        break;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        console.error("No tab found");
        break;
      }

      chrome.tabs.sendMessage(tab?.id!, message);
      break;
    }

    default:
      console.warn(`Unexpected message type received: '${HIGHLIGHT_COMPLETE}', '${message}'.`);
      break;
  }

  await closeOffscreenDocument();

  return false;
});
