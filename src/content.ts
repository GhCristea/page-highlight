import { isKnownError } from "./errors";
import getRelevantText from "./getRelevantText";
import type { WorkerMsg, ContentMsg } from "./types";

type Send = (res: ContentMsg) => void;

chrome.runtime.onMessage.addListener((msg: WorkerMsg, _sender, sendResponse: Send) => {
  try {
    if (!msg.highlight) {
      sendResponse({ error: "Highlight is falsy!", message: null });
      return false;
    }

    const walker = getTreeWalker();

    if (!walker) {
      sendResponse({ error: "No Walker!", message: null });
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

    sendResponse({ error: null, message: `Highlighted ${ranges.length} elements` });
    return true;
  } catch (error) {
    if (isKnownError(error)) {
      sendResponse({ error: error.message, message: null });
      return false;
    }
    sendResponse({ error: "Unknown error", message: null });
    return false;
  }
});

// ==> helpers

const getTreeWalker = () => {
  const relevantText = getRelevantText();

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
