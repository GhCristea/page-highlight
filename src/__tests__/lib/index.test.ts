import { getMsgHeader, validMsgHeader, validMsg, isError } from '../../lib/index';
import {
  REQ_DOC_HTML,
  PROCESS_DOC,
  REL_TEXT_RES,
  HIGHLIGHT_COMPLETE,
} from '../../lib/constants';

describe('getMsgHeader', () => {
  it('should return correct header for REQ_DOC_HTML', () => {
    const header = getMsgHeader(REQ_DOC_HTML);
    expect(header).toEqual({
      type: 'request-document-html',
      target: 'content',
    });
  });

  it('should return correct header for PROCESS_DOC', () => {
    const header = getMsgHeader(PROCESS_DOC);
    expect(header).toEqual({
      type: 'process-document',
      target: 'offscreen',
    });
  });

  it('should return correct header for REL_TEXT_RES', () => {
    const header = getMsgHeader(REL_TEXT_RES);
    expect(header).toEqual({
      type: 'relevant-text-result',
      target: 'content',
    });
  });

  it('should return correct header for HIGHLIGHT_COMPLETE', () => {
    const header = getMsgHeader(HIGHLIGHT_COMPLETE);
    expect(header).toEqual({
      type: 'highlight-complete',
      target: 'background',
    });
  });

  it('should return object with type and target properties', () => {
    const header = getMsgHeader(REQ_DOC_HTML);
    expect(header).toHaveProperty('type');
    expect(header).toHaveProperty('target');
    expect(Object.keys(header)).toHaveLength(2);
  });

  it('should preserve type information', () => {
    const header = getMsgHeader(PROCESS_DOC);
    expect(typeof header.type).toBe('string');
    expect(typeof header.target).toBe('string');
  });
});

describe('isError', () => {
  it('should return true for object with error string', () => {
    const obj = { error: 'Something went wrong' };
    expect(isError(obj)).toBe(true);
  });

  it('should return false for object with non-string error', () => {
    const obj = { error: 123 };
    expect(isError(obj)).toBe(false);
  });

  it('should return false for object without error property', () => {
    const obj = { data: 'some data' };
    expect(isError(obj)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isError(undefined)).toBe(false);
  });

  it('should return false for primitive values', () => {
    expect(isError('error')).toBe(false);
    expect(isError(42)).toBe(false);
    expect(isError(true)).toBe(false);
  });

  it('should return false for array', () => {
    expect(isError([])).toBe(false);
    expect(isError(['error'])).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isError({})).toBe(false);
  });

  it('should handle objects with both error and other properties', () => {
    const obj = { error: 'Failed', data: null };
    expect(isError(obj)).toBe(true);
  });

  it('should return false for Error instances', () => {
    const error = new Error('Test');
    expect(isError(error)).toBe(false);
  });

  it('should return false when error is null', () => {
    const obj = { error: null };
    expect(isError(obj)).toBe(false);
  });

  it('should return false when error is undefined', () => {
    const obj = { error: undefined };
    expect(isError(obj)).toBe(false);
  });

  it('should return true when error is empty string', () => {
    const obj = { error: '' };
    expect(isError(obj)).toBe(true);
  });
});

describe('validMsgHeader', () => {
  it('should validate correct message header', () => {
    const msg = {
      type: REQ_DOC_HTML,
      target: 'content',
    };
    expect(validMsgHeader(msg, REQ_DOC_HTML)).toBe(true);
  });

  it('should reject message with wrong type', () => {
    const msg = {
      type: 'wrong-type',
      target: 'content',
    };
    expect(validMsgHeader(msg, REQ_DOC_HTML)).toBe(false);
  });

  it('should reject message without type property', () => {
    const msg = {
      target: 'content',
    };
    expect(validMsgHeader(msg, REQ_DOC_HTML)).toBe(false);
  });

  it('should reject message without target property', () => {
    const msg = {
      type: REQ_DOC_HTML,
    };
    expect(validMsgHeader(msg, REQ_DOC_HTML)).toBe(false);
  });

  it('should reject null', () => {
    expect(validMsgHeader(null, REQ_DOC_HTML)).toBe(false);
  });

  it('should reject undefined', () => {
    expect(validMsgHeader(undefined, REQ_DOC_HTML)).toBe(false);
  });

  it('should reject primitive values', () => {
    expect(validMsgHeader('string', REQ_DOC_HTML)).toBe(false);
    expect(validMsgHeader(42, REQ_DOC_HTML)).toBe(false);
    expect(validMsgHeader(true, REQ_DOC_HTML)).toBe(false);
  });

  it('should reject arrays', () => {
    expect(validMsgHeader([], REQ_DOC_HTML)).toBe(false);
  });

  it('should validate all message types correctly', () => {
    const types = [REQ_DOC_HTML, PROCESS_DOC, REL_TEXT_RES, HIGHLIGHT_COMPLETE];
    const targets = ['content', 'offscreen', 'content', 'background'];

    types.forEach((type, index) => {
      const msg = { type, target: targets[index] };
      expect(validMsgHeader(msg, type)).toBe(true);
    });
  });

  it('should handle messages with additional properties', () => {
    const msg = {
      type: REQ_DOC_HTML,
      target: 'content',
      data: 'extra data',
      error: null,
    };
    expect(validMsgHeader(msg, REQ_DOC_HTML)).toBe(true);
  });

  it('should be type-specific', () => {
    const msg = {
      type: REQ_DOC_HTML,
      target: 'content',
    };
    expect(validMsgHeader(msg, REQ_DOC_HTML)).toBe(true);
    expect(validMsgHeader(msg, PROCESS_DOC)).toBe(false);
  });
});

describe('validMsg', () => {
  it('should validate message with data', () => {
    const msg = {
      type: PROCESS_DOC,
      target: 'offscreen',
      data: 'some data',
    };
    expect(validMsg(msg, PROCESS_DOC)).toBe(true);
  });

  it('should validate message with error', () => {
    const msg = {
      type: REL_TEXT_RES,
      target: 'content',
      error: 'Error message',
    };
    expect(validMsg(msg, REL_TEXT_RES)).toBe(true);
  });

  it('should reject message without data or error', () => {
    const msg = {
      type: PROCESS_DOC,
      target: 'offscreen',
    };
    expect(validMsg(msg, PROCESS_DOC)).toBe(false);
  });

  it('should reject message with wrong type', () => {
    const msg = {
      type: 'wrong-type',
      target: 'offscreen',
      data: 'some data',
    };
    expect(validMsg(msg, PROCESS_DOC)).toBe(false);
  });

  it('should reject message with non-string data', () => {
    const msg = {
      type: PROCESS_DOC,
      target: 'offscreen',
      data: 123,
    };
    expect(validMsg(msg, PROCESS_DOC)).toBe(false);
  });

  it('should reject message with non-string error', () => {
    const msg = {
      type: REL_TEXT_RES,
      target: 'content',
      error: { message: 'error' },
    };
    expect(validMsg(msg, REL_TEXT_RES)).toBe(false);
  });

  it('should reject null', () => {
    expect(validMsg(null, PROCESS_DOC)).toBe(false);
  });

  it('should reject undefined', () => {
    expect(validMsg(undefined, PROCESS_DOC)).toBe(false);
  });

  it('should validate message with both data and error', () => {
    const msg = {
      type: PROCESS_DOC,
      target: 'offscreen',
      data: 'data',
      error: 'error',
    };
    expect(validMsg(msg, PROCESS_DOC)).toBe(true);
  });

  it('should handle empty string data', () => {
    const msg = {
      type: PROCESS_DOC,
      target: 'offscreen',
      data: '',
    };
    expect(validMsg(msg, PROCESS_DOC)).toBe(true);
  });

  it('should handle empty string error', () => {
    const msg = {
      type: REL_TEXT_RES,
      target: 'content',
      error: '',
    };
    expect(validMsg(msg, REL_TEXT_RES)).toBe(true);
  });

  it('should validate all message types', () => {
    const messages = [
      { type: REQ_DOC_HTML, target: 'content', data: 'test' },
      { type: PROCESS_DOC, target: 'offscreen', data: 'test' },
      { type: REL_TEXT_RES, target: 'content', data: 'test' },
      { type: HIGHLIGHT_COMPLETE, target: 'background', data: 'test' },
    ];

    messages.forEach((msg: any) => {
      expect(validMsg(msg, msg.type)).toBe(true);
    });
  });

  it('should reject message with null data', () => {
    const msg = {
      type: PROCESS_DOC,
      target: 'offscreen',
      data: null,
    };
    expect(validMsg(msg, PROCESS_DOC)).toBe(false);
  });

  it('should reject message with null error', () => {
    const msg = {
      type: REL_TEXT_RES,
      target: 'content',
      error: null,
    };
    expect(validMsg(msg, REL_TEXT_RES)).toBe(false);
  });
});

describe('Integration: Message Creation and Validation', () => {
  it('should create and validate data message', () => {
    const header = getMsgHeader(PROCESS_DOC);
    const msg = { ...header, data: 'document html' };
    expect(validMsg(msg, PROCESS_DOC)).toBe(true);
    expect(isError(msg)).toBe(false);
  });

  it('should create and validate error message', () => {
    const header = getMsgHeader(REL_TEXT_RES);
    const msg = { ...header, error: 'Processing failed' };
    expect(validMsg(msg, REL_TEXT_RES)).toBe(true);
    expect(isError(msg)).toBe(true);
  });

  it('should handle complete message flow', () => {
    const reqHeader = getMsgHeader(REQ_DOC_HTML);
    expect(validMsgHeader(reqHeader, REQ_DOC_HTML)).toBe(true);

    const processMsg = { ...getMsgHeader(PROCESS_DOC), data: '<html></html>' };
    expect(validMsg(processMsg, PROCESS_DOC)).toBe(true);

    const resultMsg = { ...getMsgHeader(REL_TEXT_RES), data: 'relevant text' };
    expect(validMsg(resultMsg, REL_TEXT_RES)).toBe(true);

    const completeMsg = { ...getMsgHeader(HIGHLIGHT_COMPLETE), data: 'Highlighted 5 elements' };
    expect(validMsg(completeMsg, HIGHLIGHT_COMPLETE)).toBe(true);
  });
});