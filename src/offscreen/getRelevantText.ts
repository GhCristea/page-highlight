import winkNLP, { type SentenceImportance } from "wink-nlp";
import model from "wink-eng-lite-web-model";
import type { Sentence } from "../lib/types";
import { SENTENCE_IMPORTANCE } from "../lib/constants";
const nlp = winkNLP(model, ["sbd", "pos"]);

const getRelevantText = (textContent: string): Sentence[] => {
  const top = 0.2;
  const doc = nlp.readDoc(textContent);

  const descOrderImportance = (
    doc.out(nlp.its.sentenceWiseImportance) as SentenceImportance[]
  ).sort((a, b) => b.importance - a.importance);

  const topSentences = descOrderImportance.slice(0, descOrderImportance.length * top);

  const splitIndex = Math.floor(topSentences.length / 3);
  const high = topSentences[splitIndex].importance;
  const medium = topSentences[splitIndex * 2].importance;

  const sentences = topSentences.map((si) => ({
    txt: doc.sentences().itemAt(si.index).out(),
    level:
      si.importance > high
        ? SENTENCE_IMPORTANCE[0]
        : si.importance > medium
        ? SENTENCE_IMPORTANCE[1]
        : SENTENCE_IMPORTANCE[2],
  }));

  doc.sentences().itemAt;

  return sentences;
};

export default getRelevantText;
