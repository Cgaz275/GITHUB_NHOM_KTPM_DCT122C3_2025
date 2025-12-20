import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import bootstrap from '../../bootstrap';

// Mock the hookable utility
jest.mock('../../../../lib/util/hookable', () => ({
  hookable: jest.fn((fn) => fn)
}));

// Mock the services
jest.mock('../../services/loginUserWithEmail', () => ({
  loginUserWithEmail: jest.fn()
}));

jest.mock('../../services/logoutUser', () => ({
  logoutUser: jest.fn()
}));

describe('bootstrap', () => {
  let mockRequest;
  let mockSessionSave;
  let bootstrapFn;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSessionSave = jest.fn((callback) => {
      if (callback) callback();
    });

    // Set up mock request for each test
    mockRequest = {
      session: {
        userID: 1,
        save: mockSessionSave
      },
      locals: {
        user: {
          admin_user_id: 1,
          email: 'test@example.com'
        }
      }
    };

    // Execute bootstrap to extend the request object
    bootstrapFn = bootstrap();
  });

  describe('loginUserWithEmail method', () => {
    describe('TRUE branch - session exists', () => {
      it('[TRUE BRANCH] should call session.save when session exists', async () => {
        const mockCallback = jest.fn();
        const { loginUserWithEmail: mockLoginService } = require('../../services/loginUserWithEmail');
        mockLoginService.mockResolvedValue(undefined);

        await mockRequest.loginUserWithEmail.call(mockRequest, 'test@example.com', 'password123', mockCallback);

        expect(mockSessionSave).toHaveBeenCalledWith(mockCallback);
      });

      it('[TRUE BRANCH] should execute callback when session exists and save completes', async () => {
        const mockCallback = jest.fn();
        const { loginUserWithEmail: mockLoginService } = require('../../services/loginUserWithEmail');
        mockLoginService.mockResolvedValue(undefined);

        await mockRequest.loginUserWithEmail.call(mockRequest, 'test@example.com', 'password123', mockCallback);

        expect(mockCallback).toHaveBeenCalled();
      });
    });

    describe('FALSE branch - session missing', () => {
      it('[FALSE BRANCH] should NOT call session.save when session is undefined', async () => {
        const mockCallback = jest.fn();
        const requestNoSession = {
          locals: { user: null }
        };
        const { loginUserWithEmail: mockLoginService } = require('../../services/loginUserWithEmail');
        mockLoginService.mockResolvedValue(undefined);

        await mockRequest.loginUserWithEmail.call(requestNoSession, 'test@example.com', 'password123', mockCallback);

        // Since there's no session, save should not be called
        expect(mockCallback).not.toHaveBeenCalled();
      });

      it('[FALSE BRANCH] should NOT call session.save when session is null', async () => {
        const mockCallback = jest.fn();
        const requestNullSession = {
          session: null,
          locals: { user: null }
        };
        const { loginUserWithEmail: mockLoginService } = require('../../services/loginUserWithEmail');
        mockLoginService.mockResolvedValue(undefined);

        await mockRequest.loginUserWithEmail.call(requestNullSession, 'test@example.com', 'password123', mockCallback);

        expect(mockCallback).not.toHaveBeenCalled();
      });
    });
  });

  describe('logoutUser method', () => {
    describe('TRUE branch - session exists', () => {
      it('[TRUE BRANCH] should call session.save when session exists on logout', () => {
        const mockCallback = jest.fn();
        const { logoutUser: mockLogoutService } = require('../../services/logoutUser');
        mockLogoutService.mockReturnValue(undefined);

        mockRequest.logoutUser.call(mockRequest, mockCallback);

        expect(mockSessionSave).toHaveBeenCalledWith(mockCallback);
      });

      it('[TRUE BRANCH] should execute callback when session exists and logout completes', () => {
        const mockCallback = jest.fn();
        const { logoutUser: mockLogoutService } = require('../../services/logoutUser');
        mockLogoutService.mockReturnValue(undefined);

        mockRequest.logoutUser.call(mockRequest, mockCallback);

        expect(mockCallback).toHaveBeenCalled();
      });
    });

    describe('FALSE branch - session missing', () => {
      it('[FALSE BRANCH] should NOT call session.save when session is undefined on logout', () => {
        const mockCallback = jest.fn();
        const requestNoSession = {
          locals: { user: null }
        };
        const { logoutUser: mockLogoutService } = require('../../services/logoutUser');
        mockLogoutService.mockReturnValue(undefined);

        mockRequest.logoutUser.call(requestNoSession, mockCallback);

        expect(mockCallback).not.toHaveBeenCalled();
      });

      it('[FALSE BRANCH] should NOT call session.save when session is null on logout', () => {
        const mockCallback = jest.fn();
        const requestNullSession = {
          session: null,
          locals: { user: null }
        };
        const { logoutUser: mockLogoutService } = require('../../services/logoutUser');
        mockLogoutService.mockReturnValue(undefined);

        mockRequest.logoutUser.call(requestNullSession, mockCallback);

        expect(mockCallback).not.toHaveBeenCalled();
      });
    });
  });

  describe('isUserLoggedIn method', () => {
    describe('TRUE branch - userID exists', () => {
      it('[TRUE BRANCH] should return true when session has truthy userID (number)', () => {
        mockRequest.session.userID = 1;
        const result = mockRequest.isUserLoggedIn.call(mockRequest);
        expect(result).toBe(true);
      });

      it('[TRUE BRANCH] should return true when session has truthy userID (string)', () => {
        mockRequest.session.userID = 'user-123';
        const result = mockRequest.isUserLoggedIn.call(mockRequest);
        expect(result).toBe(true);
      });

      it('[TRUE BRANCH] should return true when session has truthy userID (object)', () => {
        mockRequest.session.userID = { id: 1 };
        const result = mockRequest.isUserLoggedIn.call(mockRequest);
        expect(result).toBe(true);
      });
    });

    describe('FALSE branch - userID missing or falsy', () => {
      it('[FALSE BRANCH] should return false when session userID is undefined', () => {
        mockRequest.session.userID = undefined;
        const result = mockRequest.isUserLoggedIn.call(mockRequest);
        expect(result).toBe(false);
      });

      it('[FALSE BRANCH] should return false when session userID is null', () => {
        mockRequest.session.userID = null;
        const result = mockRequest.isUserLoggedIn.call(mockRequest);
        expect(result).toBe(false);
      });

      it('[FALSE BRANCH] should return false when session userID is zero', () => {
        mockRequest.session.userID = 0;
        const result = mockRequest.isUserLoggedIn.call(mockRequest);
        expect(result).toBe(false);
      });

      it('[FALSE BRANCH] should return false when session userID is empty string', () => {
        mockRequest.session.userID = '';
        const result = mockRequest.isUserLoggedIn.call(mockRequest);
        expect(result).toBe(false);
      });

      it('[FALSE BRANCH] should return false when session userID is false', () => {
        mockRequest.session.userID = false;
        const result = mockRequest.isUserLoggedIn.call(mockRequest);
        expect(result).toBe(false);
      });

      it('[FALSE BRANCH] should return false when session is null', () => {
        mockRequest.session = null;
        const result = mockRequest.isUserLoggedIn.call(mockRequest);
        expect(result).toBe(false);
      });

      it('[FALSE BRANCH] should return false when session is undefined', () => {
        mockRequest.session = undefined;
        const result = mockRequest.isUserLoggedIn.call(mockRequest);
        expect(result).toBe(false);
      });
    });
  });

  describe('getCurrentUser method', () => {
    describe('TRUE branch - user exists', () => {
      it('[TRUE BRANCH] should return user object when locals.user exists', () => {
        const expectedUser = {
          admin_user_id: 1,
          email: 'test@example.com'
        };
        mockRequest.locals.user = expectedUser;

        const result = mockRequest.getCurrentUser.call(mockRequest);

        expect(result).toEqual(expectedUser);
      });

      it('[TRUE BRANCH] should return user with various properties', () => {
        const expectedUser = {
          admin_user_id: 42,
          email: 'admin@example.com',
          name: 'Admin User',
          uuid: 'uuid-123'
        };
        mockRequest.locals.user = expectedUser;

        const result = mockRequest.getCurrentUser.call(mockRequest);

        expect(result).toEqual(expectedUser);
        expect(result.admin_user_id).toBe(42);
        expect(result.email).toBe('admin@example.com');
      });
    });

    describe('FALSE branch - user missing', () => {
      it('[FALSE BRANCH] should return undefined when locals.user is undefined', () => {
        mockRequest.locals.user = undefined;

        const result = mockRequest.getCurrentUser.call(mockRequest);

        expect(result).toBeUndefined();
      });

      it('[FALSE BRANCH] should return undefined when locals is empty object', () => {
        mockRequest.locals = {};

        const result = mockRequest.getCurrentUser.call(mockRequest);

        expect(result).toBeUndefined();
      });

      it('[FALSE BRANCH] should return undefined when locals is null', () => {
        mockRequest.locals = null;

        const result = mockRequest.getCurrentUser.call(mockRequest);

        expect(result).toBeUndefined();
      });

      it('[FALSE BRANCH] should return undefined when locals is undefined', () => {
        mockRequest.locals = undefined;

        const result = mockRequest.getCurrentUser.call(mockRequest);

        expect(result).toBeUndefined();
      });
    });
  });

  describe('Integration tests - Login and Logout flows', () => {
    it('should work correctly in a complete login flow', async () => {
      const mockCallback = jest.fn();
      const { loginUserWithEmail: mockLoginService } = require('../../services/loginUserWithEmail');
      mockLoginService.mockResolvedValue(undefined);

      // Initial state: not logged in
      mockRequest.session.userID = undefined;
      expect(mockRequest.isUserLoggedIn.call(mockRequest)).toBe(false);

      // Simulate login - setting user data
      mockRequest.session.userID = 1;
      mockRequest.locals.user = {
        admin_user_id: 1,
        email: 'test@example.com'
      };

      // Call loginUserWithEmail which should save session
      await mockRequest.loginUserWithEmail.call(mockRequest, 'test@example.com', 'password123', mockCallback);

      // Verify logged in state
      expect(mockRequest.isUserLoggedIn.call(mockRequest)).toBe(true);
      expect(mockRequest.getCurrentUser.call(mockRequest)).toEqual({
        admin_user_id: 1,
        email: 'test@example.com'
      });
      expect(mockSessionSave).toHaveBeenCalled();
    });

    it('should work correctly in a complete logout flow', () => {
      const mockCallback = jest.fn();
      const { logoutUser: mockLogoutService } = require('../../services/logoutUser');
      mockLogoutService.mockReturnValue(undefined);

      // Initial state: logged in
      mockRequest.session.userID = 1;
      mockRequest.locals.user = {
        admin_user_id: 1,
        email: 'test@example.com'
      };
      expect(mockRequest.isUserLoggedIn.call(mockRequest)).toBe(true);

      // Call logoutUser which should save session
      mockRequest.logoutUser.call(mockRequest, mockCallback);

      // Simulate logout - clearing user data
      mockRequest.session.userID = undefined;
      mockRequest.locals.user = undefined;

      // Verify logged out state
      expect(mockRequest.isUserLoggedIn.call(mockRequest)).toBe(false);
      expect(mockRequest.getCurrentUser.call(mockRequest)).toBeUndefined();
      expect(mockSessionSave).toHaveBeenCalled();
    });
  });
});
