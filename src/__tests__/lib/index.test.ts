import { getMsgHeader, validMsgHeader, validMsg, isError } from "../../lib/index";
import {
  REQ_DOC_HTML,
  PROCESS_DOC,
  REL_TEXT_RES,
  HIGHLIGHT_COMPLETE,
} from "../../lib/constants";
import type { MsgKind } from "../../lib/types";

describe("getMsgHeader", () => {
  const validHeaders = [
    ["REQ_DOC_HTML", { type: REQ_DOC_HTML, target: "content" }],
    ["PROCESS_DOC", { type: PROCESS_DOC, target: "offscreen" }],
    ["REL_TEXT_RES", { type: REL_TEXT_RES, target: "content" }],
    ["HIGHLIGHT_COMPLETE", { type: HIGHLIGHT_COMPLETE, target: "background" }],
  ] as const;

  validHeaders.forEach(([constName, header]) => {
    it(`should return correct header for ${constName}`, () => {
      const headerResult = getMsgHeader(header.type);
      expect(headerResult).toEqual(header);
    });
  });

  it("should return object with type and target properties", () => {
    const header = getMsgHeader(REQ_DOC_HTML);
    expect(header).toHaveProperty("type");
    expect(header).toHaveProperty("target");
    expect(Object.keys(header)).toHaveLength(2);
  });

  it("should preserve type information", () => {
    const header = getMsgHeader(PROCESS_DOC);
    expect(typeof header.type).toBe("string");
    expect(typeof header.target).toBe("string");
  });
});

describe("isError", () => {
  const validErrors = [
    ["object with error string", { error: "Something went wrong" }],
    ["object with both error and other properties", { error: "Failed", data: null }],
    ["object with both error and data properties", { error: "error", data: "some data" }],
    ["object with empty error string", { error: "" }],
  ];

  validErrors.forEach(([hint, obj]) => {
    it(`should return true for ${hint}`, () => {
      expect(isError(obj)).toBe(true);
    });
  });

  const invalidErrors = [
    ["object with non-string error", { error: 123 }],
    ["object without error property", { data: "some data" }],
    ["null", null],
    ["undefined", undefined],
    ["string", "error"],
    ["number", 42],
    ["boolean", true],
    ["array", []],
    ["empty object", {}],
    ["Error instance", new Error("Test")],
    ["object with error null", { error: null }],
    ["object with error undefined", { error: undefined }],
    ["object with error object", { error: { message: "error" } }],
  ];

  invalidErrors.forEach(([hint, obj]) => {
    it(`should return false for ${hint}`, () => {
      expect(isError(obj)).toBe(false);
    });
  });
});

describe("validMsgHeader", () => {
  it("should validate correct message header", () => {
    const msg = {
      type: REQ_DOC_HTML,
      target: "content",
    };
    expect(validMsgHeader(msg, REQ_DOC_HTML)).toBe(true);
  });

  it("should validate all message types correctly", () => {
    const validTypeTargetPairs = [
      { type: REQ_DOC_HTML, target: "content" },
      { type: PROCESS_DOC, target: "offscreen" },
      { type: REL_TEXT_RES, target: "content" },
      { type: HIGHLIGHT_COMPLETE, target: "background" },
    ] as const;

    validTypeTargetPairs.forEach((header) => {
      expect(validMsgHeader(header, header.type)).toBe(true);
    });
  });

  it("should handle messages with additional properties", () => {
    const msg = {
      type: REQ_DOC_HTML,
      target: "content",
      data: "extra data",
      error: null,
    };
    expect(validMsgHeader(msg, REQ_DOC_HTML)).toBe(true);
  });

  it("should be type-specific", () => {
    const msg = {
      type: REQ_DOC_HTML,
      target: "content",
    };
    expect(validMsgHeader(msg, REQ_DOC_HTML)).toBe(true);
    expect(validMsgHeader(msg, PROCESS_DOC)).toBe(false);
  });

  const invalidHeaders = [
    ["message with wrong type", { type: "wrong-type", target: "content" }],
    ["message without type property", { target: "content" }],
    ["message without target property", { type: REQ_DOC_HTML }],
    ["null", null],
    ["undefined", undefined],
    ["string value", "string"],
    ["number value", 42],
    ["boolean value", true],
    ["arrays", []],
  ];

  invalidHeaders.forEach(([hint, obj]) => {
    it(`should return false for ${hint}`, () => {
      expect(validMsgHeader(obj, REQ_DOC_HTML)).toBe(false);
      expect(validMsgHeader(obj, PROCESS_DOC)).toBe(false);
      expect(validMsgHeader(obj, REL_TEXT_RES)).toBe(false);
      expect(validMsgHeader(obj, HIGHLIGHT_COMPLETE)).toBe(false);
    });
  });
});

describe("validMsg", () => {
  const validMessages = [
    ["data", { type: PROCESS_DOC, target: "offscreen", data: "some data" }],
    ["error", { type: REL_TEXT_RES, target: "content", error: "Error message" }],
    [
      "both data and error",
      { type: PROCESS_DOC, target: "offscreen", data: "data", error: "error" },
    ],
    ["empty string data", { type: PROCESS_DOC, target: "offscreen", data: "" }],
    ["empty string error", { type: REL_TEXT_RES, target: "content", error: "" }],
  ] as const;

  validMessages.forEach(([hint, msg]) => {
    it(`should return true for message with ${hint}`, () => {
      expect(validMsg(msg, msg.type)).toBe(true);
    });
  });

  it("should validate all message types", () => {
    const messagesWithData = [
      { type: REQ_DOC_HTML, target: "content", data: "test" },
      { type: PROCESS_DOC, target: "offscreen", data: "test" },
      { type: REL_TEXT_RES, target: "content", data: "test" },
      { type: HIGHLIGHT_COMPLETE, target: "background", data: "test" },
    ];

    messagesWithData.forEach((msg: any) => {
      expect(validMsg(msg, msg.type)).toBe(true);
    });
  });

  const invalidMessages = [
    ["without data or error", { type: PROCESS_DOC, target: "offscreen" }],
    [
      "with wrong type",
      { type: "wrong-type" as MsgKind, target: "offscreen", data: "some data" },
    ],
    ["with non-string data", { type: PROCESS_DOC, target: "offscreen", data: 123 }],
    ["with non-string error", { type: REL_TEXT_RES, target: "content", error: 123 }],
    ["with null data", { type: PROCESS_DOC, target: "offscreen", data: null }],
    ["with null error", { type: REL_TEXT_RES, target: "content", error: null }],
    ["with undefined data", { type: PROCESS_DOC, target: "offscreen", data: undefined }],
    ["with undefined error", { type: REL_TEXT_RES, target: "content", error: undefined }],
  ] as const;

  invalidMessages.forEach(([hint, msg]) => {
    it(`should return false for message with ${hint}`, () => {
      expect(validMsg(msg, msg.type)).toBe(false);
    });
  });

  it("should reject null", () => {
    expect(validMsg(null, PROCESS_DOC)).toBe(false);
  });

  it("should reject undefined", () => {
    expect(validMsg(undefined, PROCESS_DOC)).toBe(false);
  });
});

describe("Integration: Message Creation and Validation", () => {
  it("should create and validate data message", () => {
    const header = getMsgHeader(PROCESS_DOC);
    const msg = { ...header, data: "document html" };
    expect(validMsg(msg, PROCESS_DOC)).toBe(true);
    expect(isError(msg)).toBe(false);
  });

  it("should create and validate error message", () => {
    const header = getMsgHeader(REL_TEXT_RES);
    const msg = { ...header, error: "Processing failed" };
    expect(validMsg(msg, REL_TEXT_RES)).toBe(true);
    expect(isError(msg)).toBe(true);
  });

  it("should handle complete message flow", () => {
    const reqHeader = getMsgHeader(REQ_DOC_HTML);
    expect(validMsgHeader(reqHeader, REQ_DOC_HTML)).toBe(true);

    const processMsg = { ...getMsgHeader(PROCESS_DOC), data: "<html></html>" };
    expect(validMsg(processMsg, PROCESS_DOC)).toBe(true);

    const resultMsg = { ...getMsgHeader(REL_TEXT_RES), data: "relevant text" };
    expect(validMsg(resultMsg, REL_TEXT_RES)).toBe(true);

    const completeMsg = {
      ...getMsgHeader(HIGHLIGHT_COMPLETE),
      data: "Highlighted 5 elements",
    };
    expect(validMsg(completeMsg, HIGHLIGHT_COMPLETE)).toBe(true);
  });
});
