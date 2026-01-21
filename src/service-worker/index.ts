import {
  PROCESS_DOC,
  OFFSCREEN,
  BACKGROUND,
  SENTENCE_IMPORTANCE,
  type CONTENT_SCRIPT,
  HIGHLIGHT,
  HIGHLIGHT_PREFIX,
} from "../lib/constants";
import getPageContent from "../scripts/getPageContent";
import { Msg } from "../lib/types";
import { isString } from "../lib";
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
    await updateBadge(tabId, "error", "Failed to get page content");
    return;
  }

  await Promise.all([
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["scripts.bundle.js"],
    }),
    offscreenManager.open(),
  ]);

  let sentences: MsgInOffScr["data"] = null;
  let error: unknown = null;

  try {
    const response = await chrome.runtime.sendMessage<MsgOutOffScr, MsgInOffScr>({
      type: PROCESS_DOC,
      data: pageContentResult,
    });

    if (chrome.runtime.lastError) {
      error = chrome.runtime.lastError.message || null;
    } else if (response) {
      sentences = response.data;
      error = response.error;
    } else {
      error = "No response from offscreen document";
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Communication error";
  }

  if (!sentences) {
    await updateBadge(tabId, "error", isString(error) ? error : "Failed to process document");
    await offscreenManager.close();
    return;
  }

  const [{ data: highlightCompleteResult }] = await Promise.all([
    chrome.tabs.sendMessage<MsgOutScripts, MsgInScripts>(tabId, {
      type: HIGHLIGHT,
      data: sentences,
    }),
    chrome.scripting.insertCSS({
      target: { tabId },
      files: ["highlight.css"],
      origin: "AUTHOR",
    }),
  ]);

  if (!Array.isArray(highlightCompleteResult)) {
    await updateBadge(tabId, "error", "Failed to highlight elements");
  }

  console.log(highlightCompleteResult);

  await offscreenManager.close();
};

chrome.action.onClicked.addListener(onClicked);
