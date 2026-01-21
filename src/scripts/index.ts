import type { Msg } from "../lib/types";
import highlightElements from "./highlightElements";
import { HIGHLIGHT, CONTENT_SCRIPT, BACKGROUND, HIGHLIGHT_PREFIX } from "../lib/constants";

type MsgIn = Msg<typeof BACKGROUND, typeof CONTENT_SCRIPT>;

chrome.runtime.onMessage.addListener((msg: MsgIn, _sender, sendResponse) => {
  if (msg.type !== HIGHLIGHT) {
    return;
  }

  if (!msg.data) {
    sendResponse({ error: "Invalid message data" });
    return;
  }

  try {
    const highlighted = highlightElements(msg.data, HIGHLIGHT_PREFIX);
    sendResponse({ data: highlighted });
  } catch (error) {
    sendResponse({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});
