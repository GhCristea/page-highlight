import type { SentenceData } from "../lib/types";

const highlightElements = (data: SentenceData[]) => {
  try {
    let newInner = document.body.innerHTML;
    for (const d of data) {
      newInner = newInner.replace(new RegExp(d.sentence), (match) => {
        return `<span style="color:red">${match}</span>`;
      });
    }

    document.body.innerHTML = newInner;
    return `Highlighted elements`;
  } catch (error) {
    console.error("Error highlighting elements:", error);
    return `Error highlighting elements: ${error}`;
  }
};

export default highlightElements;
