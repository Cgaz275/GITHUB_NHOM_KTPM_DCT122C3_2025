import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// ==============================================================
// IMPORTANT: All jest.mock() calls MUST come before imports
// of the functions being tested to ensure proper mocking
// ==============================================================

// Mock pool FIRST before other mocks that might use it
jest.mock('../../../../lib/postgres/connection', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }
}));

// Mock getConfig before importing getSessionConfig
const mockGetConfig = jest.fn();
jest.mock('../../../../lib/util/getConfig', () => ({
  getConfig: mockGetConfig
}));

// Mock express-session
jest.mock('express-session', () => {
  return {
    default: {
      Store: class Store {}
    },
    __esModule: true
  };
});

// Mock connect-pg-simple - MUST be after other mocks
jest.mock('connect-pg-simple', () => {
  return jest.fn(() => {
    return class MockSessionStore {
      constructor(options) {
        this.pool = options.pool;
      }
    };
  });
});

// NOW import the function being tested AFTER all mocks are set up
import { getSessionConfig } from '../../services/getSessionConfig';

describe('getSessionConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default implementation: return the default value passed in
    mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);
  });

  describe('SessionStorage Store Creation Coverage', () => {
    it('[EXECUTION] should create sessionStorage store with pool connection', () => {
      const config = getSessionConfig('test-secret');

      expect(config).toBeDefined();
      expect(config.store).toBeDefined();
      expect(config.store.constructor.name).toBe('MockSessionStore');
    });

    it('[EXECUTION] should pass pool to sessionStorage store constructor', () => {
      const config = getSessionConfig('test-secret');

      expect(config.store.pool).toBeDefined();
    });

    it('[EXECUTION] should initialize store without throwing errors', () => {
      expect(() => {
        getSessionConfig('test-secret');
      }).not.toThrow();
    });
  });

  describe('getConfig - resave Configuration Branches', () => {
    describe('resave TRUE branch', () => {
      it('[TRUE BRANCH] should use resave=true when getConfig returns true', () => {
        mockGetConfig.mockImplementation((key, defaultValue) => {
          if (key === 'system.session.resave') {
            return true;
          }
          return defaultValue;
        });

        const config = getSessionConfig('secret');

        expect(config.resave).toBe(true);
        expect(mockGetConfig).toHaveBeenCalledWith('system.session.resave', false);
      });

      it('[TRUE BRANCH] should set resave config value correctly', () => {
        mockGetConfig.mockImplementation((key, defaultValue) => {
          if (key === 'system.session.resave') {
            return true;
          }
          return defaultValue;
        });

        const config = getSessionConfig('secret');

        expect(typeof config.resave).toBe('boolean');
        expect(config.resave).toBe(true);
      });
    });

    describe('resave FALSE branch - default', () => {
      it('[FALSE BRANCH] should use resave=false when getConfig returns false', () => {
        mockGetConfig.mockImplementation((key, defaultValue) => {
          if (key === 'system.session.resave') {
            return false;
          }
          return defaultValue;
        });

        const config = getSessionConfig('secret');

        expect(config.resave).toBe(false);
        expect(mockGetConfig).toHaveBeenCalledWith('system.session.resave', false);
      });

      it('[FALSE BRANCH] should use resave=false (default) when getConfig returns undefined', () => {
        mockGetConfig.mockImplementation((key, defaultValue) => {
          if (key === 'system.session.resave') {
            return undefined;
          }
          return defaultValue;
        });

        const config = getSessionConfig('secret');

        expect(config.resave).toBe(false);
      });

      it('[FALSE BRANCH] should use resave=false when getConfig not called with custom value', () => {
        mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

        const config = getSessionConfig('secret');

        expect(config.resave).toBe(false);
      });
    });
  });

  describe('getConfig - saveUninitialized Configuration Branches', () => {
    describe('saveUninitialized TRUE branch', () => {
      it('[TRUE BRANCH] should use saveUninitialized=true when getConfig returns true', () => {
        mockGetConfig.mockImplementation((key, defaultValue) => {
          if (key === 'system.session.saveUninitialized') {
            return true;
          }
          return defaultValue;
        });

        const config = getSessionConfig('secret');

        expect(config.saveUninitialized).toBe(true);
        expect(mockGetConfig).toHaveBeenCalledWith('system.session.saveUninitialized', false);
      });

      it('[TRUE BRANCH] should set saveUninitialized config value correctly', () => {
        mockGetConfig.mockImplementation((key, defaultValue) => {
          if (key === 'system.session.saveUninitialized') {
            return true;
          }
          return defaultValue;
        });

        const config = getSessionConfig('secret');

        expect(typeof config.saveUninitialized).toBe('boolean');
        expect(config.saveUninitialized).toBe(true);
      });
    });

    describe('saveUninitialized FALSE branch - default', () => {
      it('[FALSE BRANCH] should use saveUninitialized=false when getConfig returns false', () => {
        mockGetConfig.mockImplementation((key, defaultValue) => {
          if (key === 'system.session.saveUninitialized') {
            return false;
          }
          return defaultValue;
        });

        const config = getSessionConfig('secret');

        expect(config.saveUninitialized).toBe(false);
        expect(mockGetConfig).toHaveBeenCalledWith('system.session.saveUninitialized', false);
      });

      it('[FALSE BRANCH] should use saveUninitialized=false (default) when getConfig returns undefined', () => {
        mockGetConfig.mockImplementation((key, defaultValue) => {
          if (key === 'system.session.saveUninitialized') {
            return undefined;
          }
          return defaultValue;
        });

        const config = getSessionConfig('secret');

        expect(config.saveUninitialized).toBe(false);
      });

      it('[FALSE BRANCH] should use saveUninitialized=false when getConfig not called with custom value', () => {
        mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

        const config = getSessionConfig('secret');

        expect(config.saveUninitialized).toBe(false);
      });
    });
  });

  describe('getConfig Mock Call Verification', () => {
    it('should call getConfig with system.session.resave key and default false', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      getSessionConfig('secret');

      expect(mockGetConfig).toHaveBeenCalledWith('system.session.resave', false);
    });

    it('should call getConfig with system.session.saveUninitialized key and default false', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      getSessionConfig('secret');

      expect(mockGetConfig).toHaveBeenCalledWith('system.session.saveUninitialized', false);
    });

    it('should call getConfig exactly twice per invocation', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      getSessionConfig('secret');

      expect(mockGetConfig).toHaveBeenCalledTimes(2);
    });

    it('should call getConfig with correct default values', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      getSessionConfig('secret');

      const calls = mockGetConfig.mock.calls;
      expect(calls.some(call => call[0] === 'system.session.resave' && call[1] === false)).toBe(true);
      expect(calls.some(call => call[0] === 'system.session.saveUninitialized' && call[1] === false)).toBe(true);
    });
  });

  describe('Basic Configuration Properties', () => {
    it('should create session config with correct default structure', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      const config = getSessionConfig('test-secret');

      expect(config).toBeDefined();
      expect(config.secret).toBe('test-secret');
      expect(config.cookie).toBeDefined();
      expect(config.cookie.maxAge).toBe(24 * 60 * 60 * 1000);
      expect(config.resave).toBe(false);
      expect(config.saveUninitialized).toBe(false);
      expect(config.store).toBeDefined();
    });

    it('should pass cookieSecret to session config', () => {
      const secret = 'my-custom-secret';
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      const config = getSessionConfig(secret);

      expect(config.secret).toBe(secret);
    });

    it('should set cookie maxAge to 24 hours', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      const config = getSessionConfig('secret');
      const expectedMaxAge = 24 * 60 * 60 * 1000;

      expect(config.cookie.maxAge).toBe(expectedMaxAge);
    });
  });

  describe('Type Safety and Properties', () => {
    it('should return SessionOptions type with required properties', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      const config = getSessionConfig('secret');

      expect(config).toBeDefined();
      expect(config.store).toBeDefined();
      expect(config.secret).toBeDefined();
      expect(config.cookie).toBeDefined();
      expect(typeof config.resave).toBe('boolean');
      expect(typeof config.saveUninitialized).toBe('boolean');
    });

    it('should handle empty string cookie secret', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      const config = getSessionConfig('');

      expect(config.secret).toBe('');
    });

    it('should handle null cookie secret', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      const config = getSessionConfig(null as any);

      expect(config.secret).toBe(null);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in cookie secret', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      const specialSecret = 'secret@#$%^&*()';
      const config = getSessionConfig(specialSecret);

      expect(config.secret).toBe(specialSecret);
    });

    it('should handle very long cookie secret', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      const longSecret = 'a'.repeat(1000);
      const config = getSessionConfig(longSecret);

      expect(config.secret).toBe(longSecret);
      expect(config.secret.length).toBe(1000);
    });

    it('should return consistent config on multiple calls with same input', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);

      const secret = 'test-secret';
      const config1 = getSessionConfig(secret);
      const config2 = getSessionConfig(secret);

      expect(config1.secret).toBe(config2.secret);
      expect(config1.cookie.maxAge).toBe(config2.cookie.maxAge);
      expect(config1.resave).toBe(config2.resave);
      expect(config1.saveUninitialized).toBe(config2.saveUninitialized);
    });
  });
});
