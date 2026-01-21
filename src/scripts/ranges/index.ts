import type { Sentence } from "../../lib/types";
import { SentenceMatcher } from "./SentenceMatcher";
import { TextNodeMap } from "./TextNodeMap";

export const getRanges = (walker: TreeWalker, sentences: Sentence[]) => {
  const textMap = new TextNodeMap();
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (node instanceof Text && node.textContent) {
      textMap.collect(node);
    }
  }

  const matcher = new SentenceMatcher(textMap);
  const ranges: Record<Sentence["level"], Range[]> = {
    high: [],
    medium: [],
    low: [],
  };

  sentences.forEach((sentence) => {
    const foundRanges = matcher.findSentence(sentence.txt);

    foundRanges.forEach((rangeInfo) => {
      try {
        const range = new Range();
        range.setStart(rangeInfo.startContainer, rangeInfo.startOffset);
        range.setEnd(rangeInfo.endContainer, rangeInfo.endOffset);
        ranges[sentence.level].push(range);
      } catch (err) {
        console.warn("Failed to create range for sentence:", err);
      }
    });
  });

  return ranges;
};
