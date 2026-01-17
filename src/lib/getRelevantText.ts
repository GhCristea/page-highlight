import winkNLP, { type SentenceImportance } from "wink-nlp";
import model from "wink-eng-lite-web-model";
const nlp = winkNLP(model, ["sbd", "pos"]);

const getRelevantText = (textContent: string) => {

  const top = 0.2;
  const doc = nlp.readDoc(textContent);

  const descOrderImportance = (
    doc.out(nlp.its.sentenceWiseImportance) as SentenceImportance[]
  ).sort((a, b) => b.importance - a.importance);

  const topSentencesIndexes = new Map(
    descOrderImportance
      .slice(0, descOrderImportance.length * top)
      .map((s) => [s.index, s.importance])
  );

  const relevantText: string[] = [];

  doc.sentences().each((e, i) => {
    const importance = topSentencesIndexes.get(e.index());
    if (typeof importance === "number") {
      relevantText.push(e.out());
    }
  });

  return relevantText;
};

export default getRelevantText;
