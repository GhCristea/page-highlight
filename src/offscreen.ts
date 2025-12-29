import getRelevantText from "./lib/getRelevantText";
import { isKnownError } from "./lib/errors";
import { isError, validMsg, getMsgHeader } from "./lib";
import { Msg } from "./lib/types";
import { REL_TEXT_RES, PROCESS_DOC } from "./lib/constants";

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== PROCESS_DOC) {
    return false;
  }

  if (!validMsg(message, PROCESS_DOC)) {
    console.log("Invalid message received", PROCESS_DOC, message);
    return false;
  }

  if (isError(message)) {
    console.error("Error occurred while processing the document", REL_TEXT_RES, message);
    return false;
  }

  const { type, target } = getMsgHeader(REL_TEXT_RES);

  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(message.data, "text/html");

    const relevantText = getRelevantText(document);

    chrome.runtime.sendMessage<Msg>({
      type,
      target,
      data: relevantText,
    });
  } catch (error) {
    console.error("Error occurred while sending the message", REL_TEXT_RES, error);
    const errorMessage = getErrMessage(error);

    chrome.runtime.sendMessage<Msg>({
      type,
      target,
      error: errorMessage,
    });
  }

  return false;
});
function getErrMessage(error: unknown) {
  return isKnownError(error) ? error.message : "Unknown error!";
}
