import {
  REQ_DOC_HTML,
  PROCESS_DOC,
  REL_TEXT_RES,
  HIGHLIGHT_COMPLETE,
  MSG_TARGET_MAP,
} from "../../lib/constants";

describe("Message Type Constants", () => {
  const constants = [
    { name: REQ_DOC_HTML, value: "request-document-html" },
    { name: PROCESS_DOC, value: "process-document" },
    { name: REL_TEXT_RES, value: "relevant-text-result" },
    { name: HIGHLIGHT_COMPLETE, value: "highlight-complete" },
  ] as const;

  constants.forEach(({ name, value }) => {
    it(`should define ${name} constant`, () => {
      expect(name).toBe(value);
      expect(typeof name).toBe("string");
    });
  });

  it("should have unique constant values", () => {
    const constants = [REQ_DOC_HTML, PROCESS_DOC, REL_TEXT_RES, HIGHLIGHT_COMPLETE];
    const uniqueConstants = new Set(constants);
    expect(uniqueConstants.size).toBe(constants.length);
  });
});

describe("MSG_TARGET_MAP", () => {
  const map = [
    { type: REQ_DOC_HTML, target: "content" },
    { type: PROCESS_DOC, target: "offscreen" },
    { type: REL_TEXT_RES, target: "content" },
    { type: HIGHLIGHT_COMPLETE, target: "background" },
  ] as const;

  map.forEach(({ type, target }) => {
    it(`should map ${type} to ${target}`, () => {
      expect(MSG_TARGET_MAP[type]).toBe(target);
    });
  });

  it("should contain all message types", () => {
    const keys = Object.keys(MSG_TARGET_MAP);
    expect(keys).toContain(REQ_DOC_HTML);
    expect(keys).toContain(PROCESS_DOC);
    expect(keys).toContain(REL_TEXT_RES);
    expect(keys).toContain(HIGHLIGHT_COMPLETE);
  });
});
