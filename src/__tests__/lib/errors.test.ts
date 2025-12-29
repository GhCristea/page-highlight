import {
  DocumentNotReadableError,
  DocumentNoContentError,
  isKnownError,
} from "../../lib/errors";

describe("DocumentNotReadableError", () => {
  it("should create an error with the correct name", () => {
    const error = new DocumentNotReadableError("Test message");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("DocumentNotReadableError");
    expect(error.message).toBe("Test message");
  });

  it("should be throwable", () => {
    expect(() => {
      throw new DocumentNotReadableError("Cannot read document");
    }).toThrow("Cannot read document");
  });

  it("should maintain stack trace", () => {
    const error = new DocumentNotReadableError("Test");
    expect(error.stack).toBeDefined();
  });

  it("should work with instanceof checks", () => {
    const error = new DocumentNotReadableError("Test");
    expect(error instanceof DocumentNotReadableError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
});

describe("DocumentNoContentError", () => {
  it("should create an error with the correct name", () => {
    const error = new DocumentNoContentError("No content");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("DocumentNoContentError");
    expect(error.message).toBe("No content");
  });

  it("should be throwable", () => {
    expect(() => {
      throw new DocumentNoContentError("Empty document");
    }).toThrow("Empty document");
  });

  it("should maintain stack trace", () => {
    const error = new DocumentNoContentError("Test");
    expect(error.stack).toBeDefined();
  });

  it("should work with instanceof checks", () => {
    const error = new DocumentNoContentError("Test");
    expect(error instanceof DocumentNoContentError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });

  it("should be different from DocumentNotReadableError", () => {
    const error = new DocumentNoContentError("Test");
    expect(error instanceof DocumentNotReadableError).toBe(false);
  });
});

describe("isKnownError", () => {
  const knownErrors = [
    new DocumentNotReadableError("Test"),
    new DocumentNoContentError("Test"),
  ];

  knownErrors.forEach((error) => {
    it(`should return true for ${error.name}`, () => {
      expect(isKnownError(error)).toBe(true);
    });
  });

  const unknownErrors = [
    { hint: "standard Error", error: new Error("Standard error") },
    { hint: "TypeError", error: new TypeError("Type error") },
    { hint: "null", error: null },
    { hint: "undefined", error: undefined },
    { hint: "string", error: "error string" },
    { hint: "number", error: 42 },
    { hint: "plain object", error: { message: "error" } },
    { hint: "array", error: [] },
  ];

  unknownErrors.forEach(({ hint, error }) => {
    it(`should return false for ${hint}`, () => {
      expect(isKnownError(error)).toBe(false);
    });
  });
});
