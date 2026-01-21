import type { Sentence } from "../lib/types";

const highlightElements = (sentences: Sentence[], highlightLevel: string) => {
  const textTags =
    "abbr, acronym, address, blockquote, br, cite, code, dfn, div, em, h1, h2, h3, h4, h5, h6, kbd, p, pre, q, samp, span, strong, var";
  const textExtTags = "b, big, hr, i, small, sub, sup, tt";
  const txtOtherTags = "dl, dt, dd, ol, ul, li, caption, table, td, th, tr, a";
  const textAllTags = `${textTags}, ${textExtTags}, ${txtOtherTags}`;
  const structureTags = "body, head, html, title";
  const IMPORTANCE = ["high", "medium", "low"] satisfies Sentence["level"][];

  try {
    if (!CSS.highlights) {
      throw new Error("CSS Custom Highlight API not supported in this browser");
    }

    CSS.highlights.clear();

    const ranges: Record<Sentence["level"], Range[]> = {
      high: [],
      medium: [],
      low: [],
    };

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;

        if (!parent) {
          return NodeFilter.FILTER_SKIP;
        }

        const parentTag = parent.tagName.toLocaleLowerCase();

        if (structureTags.includes(parentTag)) {
          return NodeFilter.FILTER_SKIP;
        }

        if (!textAllTags.includes(parentTag)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node: Node | null;

    while ((node = walker.nextNode())) {
      if (!node?.textContent) continue;

      const textContent = node.textContent;
      sentences.forEach((sentence) => {
        let searchIndex = 0;
        while (true) {
          const index = textContent.indexOf(sentence.txt, searchIndex);
          if (index === -1) break;
          if (!node) break;

          try {
            const range = new Range();
            range.setStart(node, index);
            range.setEnd(node, index + sentence.txt.length);
            ranges[sentence.level].push(range);
          } catch (err) {
            console.warn("Failed to create range for sentence:", err);
          }

          searchIndex = index + 1;
        }
      });
    }

    for (const level of IMPORTANCE) {
      if (ranges[level].length > 0) {
        const highlight = new Highlight(...ranges[level]);
        CSS.highlights.set(highlightLevel + `-${level}`, highlight);
      }
    }

    return sentences;
  } catch (error) {
    console.error("Error highlighting elements:", error);
    return null;
  }
};

export default highlightElements;
