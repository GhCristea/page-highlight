import {
  DocumentNotReadableError,
  DocumentNoContentError,
  isKnownError,
} from '../../lib/errors';

describe('DocumentNotReadableError', () => {
  it('should create an error with the correct name', () => {
    const error = new DocumentNotReadableError('Test message');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DocumentNotReadableError');
    expect(error.message).toBe('Test message');
  });

  it('should be throwable', () => {
    expect(() => {
      throw new DocumentNotReadableError('Cannot read document');
    }).toThrow('Cannot read document');
  });

  it('should maintain stack trace', () => {
    const error = new DocumentNotReadableError('Test');
    expect(error.stack).toBeDefined();
  });

  it('should work with instanceof checks', () => {
    const error = new DocumentNotReadableError('Test');
    expect(error instanceof DocumentNotReadableError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
});

describe('DocumentNoContentError', () => {
  it('should create an error with the correct name', () => {
    const error = new DocumentNoContentError('No content');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DocumentNoContentError');
    expect(error.message).toBe('No content');
  });

  it('should be throwable', () => {
    expect(() => {
      throw new DocumentNoContentError('Empty document');
    }).toThrow('Empty document');
  });

  it('should maintain stack trace', () => {
    const error = new DocumentNoContentError('Test');
    expect(error.stack).toBeDefined();
  });

  it('should work with instanceof checks', () => {
    const error = new DocumentNoContentError('Test');
    expect(error instanceof DocumentNoContentError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });

  it('should be different from DocumentNotReadableError', () => {
    const error = new DocumentNoContentError('Test');
    expect(error instanceof DocumentNotReadableError).toBe(false);
  });
});

describe('isKnownError', () => {
  it('should return true for DocumentNotReadableError', () => {
    const error = new DocumentNotReadableError('Test');
    expect(isKnownError(error)).toBe(true);
  });

  it('should return true for DocumentNoContentError', () => {
    const error = new DocumentNoContentError('Test');
    expect(isKnownError(error)).toBe(true);
  });

  it('should return false for standard Error', () => {
    const error = new Error('Standard error');
    expect(isKnownError(error)).toBe(false);
  });

  it('should return false for TypeError', () => {
    const error = new TypeError('Type error');
    expect(isKnownError(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isKnownError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isKnownError(undefined)).toBe(false);
  });

  it('should return false for string', () => {
    expect(isKnownError('error string')).toBe(false);
  });

  it('should return false for number', () => {
    expect(isKnownError(42)).toBe(false);
  });

  it('should return false for plain object', () => {
    expect(isKnownError({ message: 'error' })).toBe(false);
  });

  it('should return false for array', () => {
    expect(isKnownError([])).toBe(false);
  });

  it('should handle both known errors correctly', () => {
    const errors = [
      new DocumentNotReadableError('Test 1'),
      new DocumentNoContentError('Test 2'),
      new Error('Unknown'),
    ];

    expect(isKnownError(errors[0])).toBe(true);
    expect(isKnownError(errors[1])).toBe(true);
    expect(isKnownError(errors[2])).toBe(false);
  });
});