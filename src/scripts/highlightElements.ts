import type { Sentence } from "../lib/types";
import { getRanges } from "./ranges";

type HighlightLvl = Sentence["level"];

const highlightElements = (sentences: Sentence[], highlightPrefix: string) => {
  if (!CSS.highlights) {
    throw new Error("CSS Custom Highlight API not supported in this browser");
  }

  CSS.highlights.clear();

  const textTags =
    "abbr, acronym, address, blockquote, br, cite, code, dfn, div, em, h1, h2, h3, h4, h5, h6, kbd, p, pre, q, samp, span, strong, var";
  const textExtTags = "b, big, hr, i, small, sub, sup, tt";
  const txtOtherTags = "dl, dt, dd, ol, ul, li, caption, table, td, th, tr, a";
  const textAllTags = `${textTags}, ${textExtTags}, ${txtOtherTags}`;

  const skipElement = (element: HTMLElement) => {
    const structureTags = ["body", "head", "html", "title"];
    return structureTags.includes(element.tagName.toLocaleLowerCase());
  };

  try {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node.parentElement || skipElement(node.parentElement)) {
          return NodeFilter.FILTER_SKIP;
        }

        if (node.parentElement.closest(textAllTags)) {
          return NodeFilter.FILTER_ACCEPT;
        }

        return NodeFilter.FILTER_REJECT;
      },
    });

    const ranges = getRanges(walker, sentences);

    for (const level of Object.keys(ranges) as HighlightLvl[]) {
      if (ranges[level].length > 0) {
        const highlight = new Highlight(...ranges[level]);
        CSS.highlights.set(highlightPrefix + `-${level}`, highlight);
      }
    }

    return sentences;
  } catch (error) {
    console.error("Error highlighting elements:", error);
    return null;
  }
};

export default highlightElements;
