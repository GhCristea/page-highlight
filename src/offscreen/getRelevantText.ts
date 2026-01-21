import winkNLP, { type SentenceImportance } from "wink-nlp";
import model from "wink-eng-lite-web-model";
import type { Sentence } from "../lib/types";
import { SENTENCE_IMPORTANCE } from "../lib/constants";
const nlp = winkNLP(model, ["sbd", "pos"]);

const getRelevantText = (textContent: string): Sentence[] => {
  const top = 0.2; // 20%
  const minImportance = 0.01; // 1%

  const minCount = SENTENCE_IMPORTANCE.length; // 3
  const [High, Med, Low] = SENTENCE_IMPORTANCE;

  const doc = nlp.readDoc(textContent);

  const descOrderImportance = (doc.out(nlp.its.sentenceWiseImportance) as SentenceImportance[])
    .filter((s) => s.importance >= minImportance)
    .sort((a, b) => b.importance - a.importance);

  const count = descOrderImportance.length;

  if (count <= minCount) {
    return descOrderImportance.map((si, index) => ({
      txt: doc.sentences().itemAt(si.index).out(),
      level: SENTENCE_IMPORTANCE[index],
    }));
  }

  const sliceAt = Math.ceil(Math.max(count * top, minCount));
  const topSentences = descOrderImportance.slice(0, sliceAt);
  const splitIndex = Math.floor(topSentences.length / 3);

  const high = topSentences[splitIndex].importance;
  const medium = topSentences[splitIndex * 2].importance;

  const sentences = topSentences.map((si) => ({
    txt: doc.sentences().itemAt(si.index).out(),
    level: si.importance >= high ? High : si.importance >= medium ? Med : Low,
  }));

  return sentences;
};

export default getRelevantText;
