import { validMsgHeader, validMsg, isError, getMsgHeader } from "./lib";
import { Msg } from "./lib/types";
import { REQ_DOC_HTML, PROCESS_DOC, REL_TEXT_RES, HIGHLIGHT_COMPLETE } from "./lib/constants";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== REQ_DOC_HTML) {
    return false;
  }

  if (!validMsgHeader(msg, REQ_DOC_HTML)) {
    console.log("Invalid message received", REQ_DOC_HTML, msg);
    return false;
  }

  chrome.runtime.sendMessage<Msg>({
    ...getMsgHeader(PROCESS_DOC),
    data: document.documentElement.outerHTML,
  });
  sendResponse({ success: true });
  return false;
});

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg?.type !== REL_TEXT_RES) {
    return false;
  }

  if (!validMsg(msg, REL_TEXT_RES)) {
    console.log("Invalid message received", REL_TEXT_RES, msg);
    return false;
  }

  const { type, target } = getMsgHeader(HIGHLIGHT_COMPLETE);

  if (isError(msg)) {
    chrome.runtime.sendMessage<Msg>({
      type,
      target,
      error: msg.error || "No relevant text received",
    });
    return false;
  }

  try {
    const walker = getTreeWalker(msg.data);

    if (!walker) {
      chrome.runtime.sendMessage<Msg>({
        type,
        target,
        error: "No Walker!",
      });
      return false;
    }

    let currentNode = walker.nextNode();
    const ranges: Range[] = [];

    while (currentNode) {
      ranges.push(getRange(currentNode));
      currentNode = walker.nextNode();
    }

    for (const range of ranges) {
      const mark = document.createElement("span");
      mark.className = "highlight";
      mark.style.backgroundColor = "red";
      mark.style.color = "white";
      range.surroundContents(mark);
    }

    chrome.runtime.sendMessage<Msg>({
      type,
      target,
      data: `Highlighted ${ranges.length} elements`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    chrome.runtime.sendMessage<Msg>({
      type,
      target,
      error: errorMessage,
    });
  }

  return false;
});

const getTreeWalker = (relevantText: string) => {
  const nodeFilter: NodeFilter = (el) => {
    const isContent =
      el?.parentElement?.checkVisibility() &&
      el.parentElement.offsetTop > 0 &&
      !el.parentElement.closest("script, meta, svg, nav, footer, link");

    if (!isContent) {
      return NodeFilter.FILTER_REJECT;
    }

    const text = el.textContent ?? "";

    if (text.length < 15) {
      return NodeFilter.FILTER_REJECT;
    }

    if (relevantText.includes(text)) {
      return NodeFilter.FILTER_ACCEPT;
    }

    return NodeFilter.FILTER_REJECT;
  };

  return document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, nodeFilter);
};

const getRange = (node: Node) => {
  const range = new Range();
  range.setStart(node, 0);
  range.setEnd(node, node.textContent?.length || 0);
  return range;
};
