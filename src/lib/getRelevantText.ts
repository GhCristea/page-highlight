import { Readability, isProbablyReaderable } from "@mozilla/readability";
import { DocumentNoContentError, DocumentNotReadableError } from "./errors";
import winkNLP, { type SentenceImportance, type Sentences } from "wink-nlp";
import model from "wink-eng-lite-web-model";
import type { SentenceData } from "./types";
const nlp = winkNLP(model, ["sbd", "pos"]);

const getRelevantText = (d: Document) => {
  if (!isProbablyReaderable(d)) {
    console.error("Document is not readable");
    throw new DocumentNotReadableError("Document is not readable");
  }

  const article = new Readability(d.cloneNode(true) as Document).parse();

  if (!article?.textContent) {
    console.error("No content found in the document");
    throw new DocumentNoContentError("No content found in the document");
  }

  const top = 0.2;
  const doc = nlp.readDoc(article.textContent);

  const descOrderImportance = (
    doc.out(nlp.its.sentenceWiseImportance) as SentenceImportance[]
  ).sort((a, b) => b.importance - a.importance);

  const topSentencesIndexes = new Map(
    descOrderImportance
      .slice(0, descOrderImportance.length * top)
      .map((s) => [s.index, s.importance])
  );

  const relevantText: SentenceData[] = [];

  doc.sentences().each((e, i) => {
    const importance = topSentencesIndexes.get(e.index());
    if (importance) {
      relevantText.push({ importance, sentence: e.out() });
    }
  });

  return relevantText;
};

export default getRelevantText;
