class DocumentNotReadableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentNotReadableError";
  }
}

class DocumentNoContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentNoContentError";
  }
}

const isKnownError = (
  error: unknown
): error is DocumentNotReadableError | DocumentNoContentError => {
  return [DocumentNotReadableError, DocumentNoContentError].some(
    (KnownError) => error instanceof KnownError
  );
};

export { DocumentNotReadableError, DocumentNoContentError, isKnownError };
