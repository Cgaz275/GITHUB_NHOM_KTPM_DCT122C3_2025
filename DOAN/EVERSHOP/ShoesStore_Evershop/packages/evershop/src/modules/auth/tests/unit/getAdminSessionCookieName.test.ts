import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('getAdminSessionCookieName', () => {
  let mockGetConfig: jest.Mock;
  let getAdminSessionCookieName: any;

  beforeEach(async () => {
    // Clear all modules
    jest.resetModules();

    // Setup mock before importing
    mockGetConfig = jest.fn((key, defaultValue) => defaultValue);

    jest.unstable_mockModule('../../../../lib/util/getConfig.js', () => ({
      getConfig: mockGetConfig
    }));

    // Import after mock
    const module = await import('../../services/getAdminSessionCookieName.js');
    getAdminSessionCookieName = module.getAdminSessionCookieName;
  });

  describe('Default Value Behavior', () => {
    it('should return default cookie name when not configured', () => {
      const result = getAdminSessionCookieName();
      expect(result).toBe('asid');
    });

    it('should use default value "asid" as fallback', () => {
      mockGetConfig.mockImplementation((key, defaultValue) => defaultValue);
      const result = getAdminSessionCookieName();
      expect(result).toBe('asid');
    });
  });

  describe('Custom Configuration', () => {
    it('should return custom value when configured', () => {
      mockGetConfig.mockImplementation((key) => {
        if (key === 'system.session.adminCookieName') {
          return 'custom_admin_session_id';
        }
        return 'asid';
      });
      const result = getAdminSessionCookieName();
      expect(result).toBe('custom_admin_session_id');
    });

    it('should handle various custom values', () => {
      const customValues = ['admin_sid', 'admin_token', 'session_admin_123'];
      customValues.forEach((customValue) => {
        jest.clearAllMocks();
        mockGetConfig.mockImplementation((key) => {
          if (key === 'system.session.adminCookieName') {
            return customValue;
          }
          return 'asid';
        });
        const result = getAdminSessionCookieName();
        expect(result).toBe(customValue);
      });
    });
  });

  describe('getConfig Call Verification', () => {
    it('should call getConfig with correct key parameter', () => {
      getAdminSessionCookieName();
      expect(mockGetConfig).toHaveBeenCalledWith('system.session.adminCookieName', 'asid');
    });

    it('should call getConfig exactly once per invocation', () => {
      getAdminSessionCookieName();
      expect(mockGetConfig).toHaveBeenCalledTimes(1);
    });

    it('should pass correct default value as second parameter', () => {
      getAdminSessionCookieName();
      const calls = mockGetConfig.mock.calls;
      expect(calls[0][1]).toBe('asid');
    });
  });
});
