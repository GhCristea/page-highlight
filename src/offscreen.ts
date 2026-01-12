import getRelevantText from "./lib/getRelevantText";
import { isKnownError } from "./lib/errors";
import { getMsgHeader, validMsgHeader } from "./lib";
import { REL_TEXT_RES, PROCESS_DOC } from "./lib/constants";

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (!validMsgHeader(message, PROCESS_DOC)) {
    return false;
  }

  const { type, target } = getMsgHeader(REL_TEXT_RES);

  if (typeof message.data !== "string") {
    console.error(`Invalid ${PROCESS_DOC} message received: `, message.error);
    return false;
  }

  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(message.data, "text/html");
    const relevantText = getRelevantText(document);

    sendResponse({
      type,
      target,
      data: relevantText,
    });
  } catch (error) {
    console.error("Error occurred while sending the message", error);
    const errorMessage = getErrMessage(error);

    sendResponse({
      type,
      target,
      error: errorMessage,
    });
  }

  return true;
});

const getErrMessage = (error: unknown): string => {
  return isKnownError(error) ? error.message : "Unknown error!";
};
