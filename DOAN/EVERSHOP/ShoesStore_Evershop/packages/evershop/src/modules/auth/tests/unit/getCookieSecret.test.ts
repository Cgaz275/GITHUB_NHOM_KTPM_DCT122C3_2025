import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('getCookieSecret', () => {
  let mockGetConfig: jest.Mock;
  let getCookieSecret: any;

  beforeEach(async () => {
    // Clear all modules
    jest.resetModules();

    // Setup mock before importing
    mockGetConfig = jest.fn((key, defaultValue) => defaultValue);

    jest.unstable_mockModule('../../../../lib/util/getConfig.js', () => ({
      getConfig: mockGetConfig
    }));

    // Import after mock
    const module = await import('../../services/getCookieSecret.js');
    getCookieSecret = module.getCookieSecret;
  });

  describe('Default Value Behavior', () => {
    it('should return default cookie secret when not configured', () => {
      const result = getCookieSecret();
      expect(result).toBe('keyboard cat');
    });

    it('should use default value "keyboard cat" as fallback', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);
      const result = getCookieSecret();
      expect(result).toBe('keyboard cat');
    });
  });

  describe('Custom Configuration', () => {
    it('should return custom secret value when configured', () => {
      mockGetConfig.mockImplementation((key) => {
        if (key === 'system.session.cookieSecret') {
          return 'my-super-secret-key-123';
        }
        return 'keyboard cat';
      });
      const result = getCookieSecret();
      expect(result).toBe('my-super-secret-key-123');
    });

    it('should handle various secret formats', () => {
      const secretValues = [
        'very-long-secret-string-with-special-chars-!@#$%',
        'another_secret_with_underscores',
        'SecretWithMixedCase123'
      ];
      secretValues.forEach((secretValue) => {
        jest.clearAllMocks();
        mockGetConfig.mockImplementation((key) => {
          if (key === 'system.session.cookieSecret') {
            return secretValue;
          }
          return 'keyboard cat';
        });
        const result = getCookieSecret();
        expect(result).toBe(secretValue);
      });
    });
  });

  describe('getConfig Call Verification', () => {
    it('should call getConfig with correct key parameter', () => {
      getCookieSecret();
      expect(mockGetConfig).toHaveBeenCalledWith('system.session.cookieSecret', 'keyboard cat');
    });

    it('should call getConfig exactly once per invocation', () => {
      getCookieSecret();
      expect(mockGetConfig).toHaveBeenCalledTimes(1);
    });

    it('should pass correct default value as second parameter', () => {
      getCookieSecret();
      const calls = mockGetConfig.mock.calls;
      expect(calls[0][1]).toBe('keyboard cat');
    });

    it('should always use the same key throughout multiple calls', () => {
      getCookieSecret();
      getCookieSecret();
      getCookieSecret();
      
      const calls = mockGetConfig.mock.calls;
      expect(calls[0][0]).toBe('system.session.cookieSecret');
      expect(calls[1][0]).toBe('system.session.cookieSecret');
      expect(calls[2][0]).toBe('system.session.cookieSecret');
    });
  });
});
