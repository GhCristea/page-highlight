const highlightElements = (data: string) => {
  try {
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

      if (data.includes(text)) {
        return NodeFilter.FILTER_ACCEPT;
      }

      return NodeFilter.FILTER_REJECT;
    };

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, nodeFilter);

    let currentNode = walker.nextNode();
    const ranges: Range[] = [];

    while (currentNode) {
      const range = new Range();
      range.setStart(currentNode, 0);
      range.setEnd(currentNode, currentNode.textContent?.length || 0);
      ranges.push(range);
      currentNode = walker.nextNode();
    }

    for (const range of ranges) {
      const mark = document.createElement("span");
      mark.className = "highlight";
      mark.style.backgroundColor = "red";
      mark.style.color = "white";
      range.surroundContents(mark);
    }
    return `Highlighted ${ranges.length} elements`;
  } catch (error) {
    console.error("Error highlighting elements:", error);
    return `Error highlighting elements: ${error}`;
  }
};

export default highlightElements;
