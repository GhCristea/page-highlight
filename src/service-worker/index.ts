import {
  type OFFSCREEN,
  type BACKGROUND,
  type CONTENT_SCRIPT,
  PROCESS_DOC,
  SENTENCE_IMPORTANCE,
  HIGHLIGHT,
  HIGHLIGHT_PREFIX,
} from "../lib/constants";
import getPageContent from "../scripts/getPageContent";
import { Msg } from "../lib/types";
import { updateBadge } from "./updateBadge";
import { offscreenManager } from "./OffscreenManager";

type MsgInOffScr = Msg<typeof OFFSCREEN>;
type MsgOutOffScr = Msg<typeof BACKGROUND, typeof OFFSCREEN>;
type MsgOutScripts = Msg<typeof BACKGROUND, typeof CONTENT_SCRIPT>;
type MsgInScripts = Msg<typeof CONTENT_SCRIPT>;

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

  const [{ result: isHighlighted }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (highlightLevel: string) => {
      if (!CSS.highlights) {
        throw new Error("CSS Custom Highlight API not supported in this browser");
      }
      return CSS.highlights.has(highlightLevel);
    },
    args: [HIGHLIGHT_PREFIX + `-${SENTENCE_IMPORTANCE[0]}`],
  });

  if (isHighlighted) {
    return;
  }

  const [{ result: pageContentResult }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: getPageContent,
  });

  if (!pageContentResult) {
    const error = chrome.runtime.lastError?.message ?? "Failed to get page content";
    await updateBadge(tabId, "error", error);
    return;
  }

  await Promise.all([
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["scripts.bundle.js"],
    }),
    offscreenManager.open(),
  ]);

  const offScrRes = await chrome.runtime.sendMessage<MsgOutOffScr, MsgInOffScr>({
    type: PROCESS_DOC,
    data: pageContentResult,
  });

  if (!offScrRes.data) {
    const error =
      (offScrRes.error || chrome.runtime.lastError?.message) ?? "Failed to process document";
    await updateBadge(tabId, "error", error);
    await offscreenManager.close();
    return;
  }

  const [highlightResult] = await Promise.all([
    chrome.tabs.sendMessage<MsgOutScripts, MsgInScripts>(tabId, {
      type: HIGHLIGHT,
      data: offScrRes.data,
    }),
    chrome.scripting.insertCSS({
      target: { tabId },
      files: ["highlight.css"],
      origin: "AUTHOR",
    }),
  ]);

  if (!Array.isArray(highlightResult.data)) {
    const error =
      (highlightResult.error || chrome.runtime.lastError?.message) ??
      "Failed to highlight elements";
    await updateBadge(tabId, "error", error);
  }

  await offscreenManager.close();
};

chrome.action.onClicked.addListener(onClicked);
