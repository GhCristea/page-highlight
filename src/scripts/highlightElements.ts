const highlightElements = (sentences: string[]) => {
  const HIGHLIGHT_STYLE_ID = "page-highlight-styles";

  try {
    if (document.getElementById(HIGHLIGHT_STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = HIGHLIGHT_STYLE_ID;
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
        if (parent && (parent.tagName === "SCRIPT" || parent.tagName === "STYLE")) {
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
          if (!node) continue;

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
