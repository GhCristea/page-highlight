import {
  REQ_DOC_HTML,
  PROCESS_DOC,
  REL_TEXT_RES,
  HIGHLIGHT_COMPLETE,
  MSG_TARGET_MAP,
} from '../../lib/constants';

describe('Message Type Constants', () => {
  it('should define REQ_DOC_HTML constant', () => {
    expect(REQ_DOC_HTML).toBe('request-document-html');
    expect(typeof REQ_DOC_HTML).toBe('string');
  });

  it('should define PROCESS_DOC constant', () => {
    expect(PROCESS_DOC).toBe('process-document');
    expect(typeof PROCESS_DOC).toBe('string');
  });

  it('should define REL_TEXT_RES constant', () => {
    expect(REL_TEXT_RES).toBe('relevant-text-result');
    expect(typeof REL_TEXT_RES).toBe('string');
  });

  it('should define HIGHLIGHT_COMPLETE constant', () => {
    expect(HIGHLIGHT_COMPLETE).toBe('highlight-complete');
    expect(typeof HIGHLIGHT_COMPLETE).toBe('string');
  });

  it('should have unique constant values', () => {
    const constants = [REQ_DOC_HTML, PROCESS_DOC, REL_TEXT_RES, HIGHLIGHT_COMPLETE];
    const uniqueConstants = new Set(constants);
    expect(uniqueConstants.size).toBe(constants.length);
  });

  it('should use kebab-case naming convention', () => {
    const constants = [REQ_DOC_HTML, PROCESS_DOC, REL_TEXT_RES, HIGHLIGHT_COMPLETE];
    constants.forEach((constant) => {
      expect(constant).toMatch(/^[a-z]+(-[a-z]+)*$/);
    });
  });
});

describe('MSG_TARGET_MAP', () => {
  it('should map REQ_DOC_HTML to content', () => {
    expect(MSG_TARGET_MAP[REQ_DOC_HTML]).toBe('content');
  });

  it('should map PROCESS_DOC to offscreen', () => {
    expect(MSG_TARGET_MAP[PROCESS_DOC]).toBe('offscreen');
  });

  it('should map REL_TEXT_RES to content', () => {
    expect(MSG_TARGET_MAP[REL_TEXT_RES]).toBe('content');
  });

  it('should map HIGHLIGHT_COMPLETE to background', () => {
    expect(MSG_TARGET_MAP[HIGHLIGHT_COMPLETE]).toBe('background');
  });

  it('should contain all message types', () => {
    const keys = Object.keys(MSG_TARGET_MAP);
    expect(keys).toContain(REQ_DOC_HTML);
    expect(keys).toContain(PROCESS_DOC);
    expect(keys).toContain(REL_TEXT_RES);
    expect(keys).toContain(HIGHLIGHT_COMPLETE);
  });

  it('should have exactly 4 entries', () => {
    expect(Object.keys(MSG_TARGET_MAP).length).toBe(4);
  });

  it('should only contain valid target values', () => {
    const validTargets = ['content', 'offscreen', 'background'];
    Object.values(MSG_TARGET_MAP).forEach((target) => {
      expect(validTargets).toContain(target);
    });
  });

  it('should have consistent message flow', () => {
    expect(MSG_TARGET_MAP[REQ_DOC_HTML]).toBe('content');
    expect(MSG_TARGET_MAP[PROCESS_DOC]).toBe('offscreen');
    expect(MSG_TARGET_MAP[REL_TEXT_RES]).toBe('content');
    expect(MSG_TARGET_MAP[HIGHLIGHT_COMPLETE]).toBe('background');
  });
});

describe('Message Flow Integration', () => {
  it('should support bidirectional communication pattern', () => {
    expect(MSG_TARGET_MAP[REQ_DOC_HTML]).toBe('content');
    expect(MSG_TARGET_MAP[PROCESS_DOC]).toBe('offscreen');
    expect(MSG_TARGET_MAP[REL_TEXT_RES]).toBe('content');
    expect(MSG_TARGET_MAP[HIGHLIGHT_COMPLETE]).toBe('background');
  });
});