const highlightElements = (sentences: string[], styleId: string) => {
  const textTags =
    "abbr, acronym, address, blockquote, br, cite, code, dfn, div, em, h1, h2, h3, h4, h5, h6, kbd, p, pre, q, samp, span, strong, var";
  const textExtTags = "b, big, hr, i, small, sub, sup, tt";
  const txtOtherTags = "dl, dt, dd, ol, ul, li, caption, table, td, th, tr, a";
  const textAllTags = `${textTags}, ${textExtTags}, ${txtOtherTags}`;
  const structureTags = "body, head, html, title";

  try {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
    ::highlight(nlp-highlight) {
      background-color: rgba(255, 255, 0, 0.4);
      color: inherit;
      text-decoration: underline;
      text-decoration-color: rgba(255, 200, 0, 0.6);
      text-decoration-thickness: 2px;
    }
  `;
    document.head.appendChild(style);

    if (CSS.highlights) {
      CSS.highlights.clear();
    }

    const ranges: Range[] = [];

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
          const index = textContent.indexOf(sentence, searchIndex);
          if (index === -1) break;
          if (!node) break;

          try {
            const range = new Range();
            range.setStart(node, index);
            range.setEnd(node, index + sentence.length);
            ranges.push(range);
          } catch (err) {
            console.warn("Failed to create range for sentence:", err);
          }

          searchIndex = index + 1;
        }
      });
    }

    if (CSS.highlights && ranges.length > 0) {
      const highlight = new Highlight(...ranges);
      CSS.highlights.set("nlp-highlight", highlight);
    } else if (!CSS.highlights) {
      console.warn("CSS Custom Highlight API not supported in this browser");
    }

    return sentences;
  } catch (error) {
    console.error("Error highlighting elements:", error);
    return null;
  }
};

export default highlightElements;
