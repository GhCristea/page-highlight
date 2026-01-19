import getRelevantText from "./lib/getRelevantText";
import { DocumentNoContentError, DocumentNotReadableError, isKnownError } from "./lib/errors";
import { Msg, Payload } from "./lib/types";
import { BACKGROUND, OFFSCREEN, PROCESS_DOC } from "./lib/constants";
import { isString, objHasKeys, isError } from "./lib";
import { isProbablyReaderable, Readability } from "@mozilla/readability";

type MsgIn = Msg<typeof BACKGROUND>;
type MsgOut = Msg<typeof OFFSCREEN>;

type SendRes = (p: Payload<MsgOut["data"]>) => void;

const validHeader = (h: unknown): h is Pick<MsgIn, "type"> =>
  objHasKeys(h, ["type"]) && h.type === PROCESS_DOC;

const validMsgShape = (m: Pick<MsgIn, "type">): m is MsgIn => {
  return (objHasKeys(m, ["data"]) && isString(m.data)) || isError(m);
};

chrome.runtime.onMessage.addListener((message, _, sendResponse: SendRes) => {
  if (!validHeader(message)) return false;

  if (!validMsgShape(message)) {
    sendResponse({ error: "Invalid message format" });
    return false;
  }

  if (isError(message)) {
    sendResponse({ error: message.error });
    return false;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(message.data, "text/html");

    if (!isProbablyReaderable(doc)) {
      throw new DocumentNotReadableError("Document is not readable");
    }

    const parsed = new Readability(doc).parse();

    if (!parsed?.textContent) {
      throw new DocumentNoContentError("No text content found in the document");
    }

    const sentences = getRelevantText(parsed.textContent);

    sendResponse({ data: sentences });
  } catch (error) {
    const errorMessage = getErrMessage(error);
    sendResponse({ error: errorMessage });
  }

  return true;
});

const getErrMessage = (error: unknown): string => {
  return isKnownError(error) ? error.message : "Unknown error!";
};
