export const REQ_DOC_HTML = "request-document-html";
export const PROCESS_DOC = "process-document";
export const REL_TEXT_RES = "relevant-text-result";
export const HIGHLIGHT_COMPLETE = "highlight-complete";

export const MSG_TARGET_MAP = {
  [REQ_DOC_HTML]: "content",
  [PROCESS_DOC]: "offscreen",
  [REL_TEXT_RES]: "content",
  [HIGHLIGHT_COMPLETE]: "background",
} as const;
