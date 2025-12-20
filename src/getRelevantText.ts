import { Readability, isProbablyReaderable } from "@mozilla/readability";
import { DocumentNoContentError, DocumentNotReadableError } from "./errors";
import winkNLP, { type SentenceImportance } from "wink-nlp";
import model from "wink-eng-lite-web-model";

const getRelevantText = () => {
  if (!isProbablyReaderable(document)) {
    throw new DocumentNotReadableError("Document is not readable");
  }

  const article = new Readability(document.cloneNode(true) as Document).parse();

  if (!article?.textContent) {
    throw new DocumentNoContentError("No content found in the document");
  }

  const top = 0.2;
  const nlp = winkNLP(model, ["sbd", "pos"]);
  const doc = nlp.readDoc(article.textContent);

  const descOrderImportance = (
    doc.out(nlp.its.sentenceWiseImportance) as SentenceImportance[]
  ).sort((a, b) => b.importance - a.importance);

  const topSentencesIndexes = new Set(
    descOrderImportance.slice(0, descOrderImportance.length * top).map((s) => s.index)
  );

  let relevantText: string = "";

  doc.sentences().each((e, i) => {
    relevantText = topSentencesIndexes.has(e.index())
      ? relevantText.concat("\n", e.out())
      : relevantText;
  });

  return relevantText;
};

export default getRelevantText;
