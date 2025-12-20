import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('getFrontStoreSessionCookieName', () => {
  let mockGetConfig: jest.Mock;
  let getFrontStoreSessionCookieName: any;

  beforeEach(async () => {
    // Clear all modules
    jest.resetModules();

    // Setup mock before importing
    mockGetConfig = jest.fn((key, defaultValue) => defaultValue);

    jest.unstable_mockModule('../../../../lib/util/getConfig.js', () => ({
      getConfig: mockGetConfig
    }));

    // Import after mock
    const module = await import('../../services/getFrontStoreSessionCookieName.js');
    getFrontStoreSessionCookieName = module.getFrontStoreSessionCookieName;
  });

  describe('Default Value Behavior', () => {
    it('should return default session cookie name when not configured', () => {
      const result = getFrontStoreSessionCookieName();
      expect(result).toBe('sid');
    });

    it('should use default value "sid" as fallback', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);
      const result = getFrontStoreSessionCookieName();
      expect(result).toBe('sid');
    });
  });

  describe('Custom Configuration', () => {
    it('should return custom session cookie name when configured', () => {
      mockGetConfig.mockImplementation((key) => {
        if (key === 'system.session.cookieName') {
          return 'custom_session_id';
        }
        return 'sid';
      });
      const result = getFrontStoreSessionCookieName();
      expect(result).toBe('custom_session_id');
    });

    it('should handle various custom cookie names', () => {
      const cookieNames = ['storefront_sid', 'front_session', 'customer_session_token', 'shop_sid'];
      cookieNames.forEach((cookieName) => {
        jest.clearAllMocks();
        mockGetConfig.mockImplementation((key) => {
          if (key === 'system.session.cookieName') {
            return cookieName;
          }
          return 'sid';
        });
        const result = getFrontStoreSessionCookieName();
        expect(result).toBe(cookieName);
      });
    });
  });

  describe('getConfig Call Verification', () => {
    it('should call getConfig with correct key parameter', () => {
      getFrontStoreSessionCookieName();
      expect(mockGetConfig).toHaveBeenCalledWith('system.session.cookieName', 'sid');
    });

    it('should call getConfig exactly once per invocation', () => {
      getFrontStoreSessionCookieName();
      expect(mockGetConfig).toHaveBeenCalledTimes(1);
    });

    it('should pass correct default value as second parameter', () => {
      getFrontStoreSessionCookieName();
      const calls = mockGetConfig.mock.calls;
      expect(calls[0][1]).toBe('sid');
    });

    it('should consistently use the same configuration key', () => {
      getFrontStoreSessionCookieName();
      getFrontStoreSessionCookieName();
      
      const calls = mockGetConfig.mock.calls;
      expect(calls.length).toBe(2);
      expect(calls[0][0]).toBe('system.session.cookieName');
      expect(calls[1][0]).toBe('system.session.cookieName');
    });
  });

  describe('Return Value Type', () => {
    it('should always return a string', () => {
      const result = getFrontStoreSessionCookieName();
      expect(typeof result).toBe('string');
    });

    it('should not return null or undefined', () => {
      const result = getFrontStoreSessionCookieName();
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
    });
  });
});
