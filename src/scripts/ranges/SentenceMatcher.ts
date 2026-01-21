import { getFuzzyLimits } from "./getFuzzyLimits";
import type { TextNodeMap } from "./TextNodeMap";

const CITATION_PATTERN = /^\s*\[\d+\]\s*|\s*\[\d+\]?\s*$/g;

export class SentenceMatcher {
  constructor(private textMap: TextNodeMap) {}

  findSentence(sentence: string): StaticRange[] {
    const normalized = this.normalizeSentence(sentence);
    if (!normalized) return [];

    const results: StaticRange[] = [];
    let searchOffset = 0;

    while (true) {
      const [startIndex, endIndex] = getFuzzyLimits(
        normalized,
        this.textMap.read,
        searchOffset
      );

      if (startIndex === -1) break;

      const range = this.mapRange(startIndex, endIndex);
      if (range) {
        results.push(range);
      } else {
        console.warn(
          `Could not map match at [${startIndex}, ${endIndex}] to DOM nodes for sentence: ${sentence}`
        );
      }

      searchOffset = startIndex + endIndex;
    }

    return results;
  }

  mapRange(contentStart: number, contentLength: number): StaticRange | null {
    const startNode = this.textMap.findNodeAtOffset(contentStart);

    if (!startNode) return null;
    const endNode = this.textMap.findNodeAtOffset(contentStart + contentLength);

    if (!endNode) return null;

    const startOffset = contentStart - startNode.startOffset;
    const endOffset = contentStart + contentLength - endNode.startOffset;

    return {
      collapsed:
        startNode.startContainer === endNode.startContainer && startOffset === endOffset,
      startContainer: startNode.startContainer,
      startOffset,
      endContainer: endNode.startContainer,
      endOffset,
    };
  }

  private normalizeSentence(sentence: string): string {
    return sentence.trim().replace(CITATION_PATTERN, "").trim();
  }
}
