// Mock Chrome APIs
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
    getContexts: jest.fn(),
  },
  action: {
    onClicked: {
      addListener: jest.fn(),
    },
    disable: jest.fn(),
    setTitle: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
    setBadgeText: jest.fn(),
  },
  tabs: {
    sendMessage: jest.fn(),
    query: jest.fn(),
  },
  scripting: {
    executeScript: jest.fn(),
  },
  offscreen: {
    createDocument: jest.fn(),
    closeDocument: jest.fn(),
  },
} as any;

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};