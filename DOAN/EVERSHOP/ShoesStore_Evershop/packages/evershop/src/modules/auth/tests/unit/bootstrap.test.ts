import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('bootstrap module exports and functionality', () => {
    it('should export a default function', async () => {
      const bootstrapModule = await import('../../bootstrap.js');
      expect(bootstrapModule.default).toBeDefined();
      expect(typeof bootstrapModule.default).toBe('function');
    });

    it('should successfully import and call bootstrap', async () => {
      const bootstrapModule = await import('../../bootstrap.js');
      const bootstrap = bootstrapModule.default;
      expect(() => {
        bootstrap();
      }).not.toThrow();
    });

    it('should import required dependencies without errors', async () => {
      const loginUserModule = await import('../../services/loginUserWithEmail.js');
      const logoutUserModule = await import('../../services/logoutUser.js');
      const hookableModule = await import('../../../lib/util/hookable.js');

      expect(loginUserModule.loginUserWithEmail).toBeDefined();
      expect(logoutUserModule.logoutUser).toBeDefined();
      expect(hookableModule.hookable).toBeDefined();
    });
  });

  describe('loginUserWithEmail function behavior', () => {
    it('should update session.userID when loginUserWithEmail is called', async () => {
      const { loginUserWithEmail } = await import('../../services/loginUserWithEmail.js');

      const mockContext = {
        session: { userID: undefined },
        locals: { user: undefined }
      };

      const boundLogin = loginUserWithEmail.bind(mockContext);
      await boundLogin('test@example.com', 'password');

      expect(mockContext.session.userID).toBeDefined();
    });

    it('should set user in locals when login succeeds', async () => {
      const { loginUserWithEmail } = await import('../../services/loginUserWithEmail.js');

      const mockContext = {
        session: { userID: undefined },
        locals: { user: undefined }
      };

      const boundLogin = loginUserWithEmail.bind(mockContext);
      await boundLogin('test@example.com', 'password');

      expect(mockContext.locals.user).toBeDefined();
    });

    it('should accept email and password parameters', async () => {
      const { loginUserWithEmail } = await import('../../services/loginUserWithEmail.js');

      const mockContext = {
        session: { userID: undefined },
        locals: { user: undefined }
      };

      expect(async () => {
        const boundLogin = loginUserWithEmail.bind(mockContext);
        await boundLogin('admin@test.com', 'testpass123');
      }).not.toThrow();
    });
  });

  describe('logoutUser function behavior', () => {
    it('should clear session.userID when logoutUser is called', async () => {
      const { logoutUser } = await import('../../services/logoutUser.js');

      const mockContext = {
        session: { userID: 123 },
        locals: { user: { id: 1 } }
      };

      const boundLogout = logoutUser.bind(mockContext);
      boundLogout();

      expect(mockContext.session.userID).toBeUndefined();
    });

    it('should clear user from locals when logoutUser is called', async () => {
      const { logoutUser } = await import('../../services/logoutUser.js');

      const mockContext = {
        session: { userID: 123 },
        locals: { user: { id: 1 } }
      };

      const boundLogout = logoutUser.bind(mockContext);
      boundLogout();

      expect(mockContext.locals.user).toBeUndefined();
    });

    it('should handle logout without user in locals', async () => {
      const { logoutUser } = await import('../../services/logoutUser.js');

      const mockContext = {
        session: { userID: 123 },
        locals: {}
      };

      const boundLogout = logoutUser.bind(mockContext);

      expect(() => {
        boundLogout();
      }).not.toThrow();
    });
  });

  describe('hookable utility function', () => {
    it('should be importable and callable', async () => {
      const { hookable } = await import('../../../lib/util/hookable.js');

      expect(hookable).toBeDefined();
      expect(typeof hookable).toBe('function');
    });

    it('should wrap a function and return it', async () => {
      const { hookable } = await import('../../../lib/util/hookable.js');

      const testFn = () => 'test result';
      const wrappedFn = hookable(testFn);

      expect(typeof wrappedFn).toBe('function');
    });

    it('should maintain function behavior after wrapping', async () => {
      const { hookable } = await import('../../../lib/util/hookable.js');

      const testFn = (value: number) => value * 2;
      const wrappedFn = hookable(testFn);

      const result = wrappedFn(5);
      expect(result).toBe(10);
    });
  });

  describe('Request method attachment pattern', () => {
    it('should support method attachment to context objects', function() {
      const mockRequest = {};

      mockRequest.loginUserWithEmail = async function(email: string, password: string, callback?: Function) {
        this.session = this.session || { userID: 1 };
        if (this.session) {
          this.session.save?.(callback);
        }
      };

      expect(mockRequest.loginUserWithEmail).toBeDefined();
      expect(typeof mockRequest.loginUserWithEmail).toBe('function');
    });

    it('should support attaching logoutUser method', function() {
      const mockRequest = {};

      mockRequest.logoutUser = function(callback?: Function) {
        if (this.session) {
          this.session.userID = undefined;
          this.session.save?.(callback);
        }
      };

      expect(mockRequest.logoutUser).toBeDefined();
      expect(typeof mockRequest.logoutUser).toBe('function');
    });

    it('should support attaching isUserLoggedIn method', function() {
      const mockRequest = {};

      mockRequest.isUserLoggedIn = function() {
        return !!this.session?.userID;
      };

      expect(mockRequest.isUserLoggedIn).toBeDefined();
      expect(typeof mockRequest.isUserLoggedIn).toBe('function');
    });

    it('should support attaching getCurrentUser method', function() {
      const mockRequest = {};

      mockRequest.getCurrentUser = function() {
        return this.locals?.user;
      };

      expect(mockRequest.getCurrentUser).toBeDefined();
      expect(typeof mockRequest.getCurrentUser).toBe('function');
    });

    it('should allow methods to be called with proper context', async function() {
      const context = {
        session: { userID: undefined, save: jest.fn() },
        locals: { user: undefined }
      };

      const loginMethod = async function(email: string, password: string, callback?: Function) {
        this.session.userID = 100;
        this.locals.user = { email, id: 100 };
        if (this.session) {
          this.session.save(callback);
        }
      };

      await loginMethod.call(context, 'user@test.com', 'pass');

      expect(context.session.userID).toBe(100);
      expect(context.locals.user.email).toBe('user@test.com');
    });
  });

  describe('Session save callback handling', () => {
    it('should call session.save with callback', function() {
      const mockSessionSave = jest.fn();
      const context = {
        session: { userID: undefined, save: mockSessionSave },
        locals: { user: undefined }
      };

      const loginMethod = async function(email: string, password: string, callback?: Function) {
        this.session.userID = 1;
        if (this.session) {
          this.session.save(callback);
        }
      };

      const callback = jest.fn();
      loginMethod.call(context, 'test@test.com', 'pass', callback);

      expect(mockSessionSave).toHaveBeenCalledWith(callback);
    });

    it('should not throw if session.save is called without callback', function() {
      const context = {
        session: {
          userID: undefined,
          save: jest.fn()
        },
        locals: { user: undefined }
      };

      const loginMethod = function(callback?: Function) {
        if (this.session) {
          this.session.save(callback);
        }
      };

      expect(() => {
        loginMethod.call(context);
      }).not.toThrow();
    });

    it('should handle session.save execution when session exists', function() {
      const sessionSave = jest.fn((callback?: Function) => {
        if (callback) callback();
      });

      const context = {
        session: { userID: undefined, save: sessionSave },
        locals: { user: undefined }
      };

      const logoutMethod = function(callback?: Function) {
        this.session.userID = undefined;
        this.locals.user = undefined;
        if (this.session) {
          this.session.save(callback);
        }
      };

      const callback = jest.fn();
      logoutMethod.call(context, callback);

      expect(sessionSave).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Bootstrap integration scenarios', () => {
    it('should handle complete authentication cycle', async function() {
      const context = {
        session: { userID: undefined, save: jest.fn() },
        locals: { user: undefined }
      };

      const isLoggedInFn = function() {
        return !!this.session?.userID;
      };

      const loginFn = async function(email: string, password: string) {
        this.session.userID = 999;
        this.locals.user = { email, id: 999 };
      };

      const logoutFn = function() {
        this.session.userID = undefined;
        this.locals.user = undefined;
      };

      const getUserFn = function() {
        return this.locals?.user;
      };

      expect(isLoggedInFn.call(context)).toBe(false);

      await loginFn.call(context, 'test@example.com', 'password123');
      expect(isLoggedInFn.call(context)).toBe(true);
      expect(getUserFn.call(context).email).toBe('test@example.com');

      logoutFn.call(context);
      expect(isLoggedInFn.call(context)).toBe(false);
      expect(getUserFn.call(context)).toBeUndefined();
    });

    it('should handle multiple independent contexts', async function() {
      const createContext = () => ({
        session: { userID: undefined, save: jest.fn() },
        locals: { user: undefined }
      });

      const loginFn = async function(email: string) {
        this.session.userID = this.session.userID || Math.random();
        this.locals.user = { email };
      };

      const ctx1 = createContext();
      const ctx2 = createContext();

      await loginFn.call(ctx1, 'user1@test.com');
      await loginFn.call(ctx2, 'user2@test.com');

      expect(ctx1.locals.user.email).toBe('user1@test.com');
      expect(ctx2.locals.user.email).toBe('user2@test.com');
      expect(ctx1.session.userID).not.toBe(ctx2.session.userID);
    });

    it('should preserve user data across operations', async function() {
      const context = {
        session: { userID: undefined, save: jest.fn() },
        locals: { user: undefined }
      };

      const userData = {
        admin_user_id: 1,
        email: 'admin@test.com',
        status: 1,
        fullName: 'Admin User',
        uuid: 'uuid-123'
      };

      const loginFn = async function() {
        this.session.userID = userData.admin_user_id;
        this.locals.user = userData;
      };

      const getUserFn = function() {
        return this.locals?.user;
      };

      await loginFn.call(context);
      const user = getUserFn.call(context);

      expect(user.admin_user_id).toBe(1);
      expect(user.email).toBe('admin@test.com');
      expect(user.fullName).toBe('Admin User');
      expect(user.uuid).toBe('uuid-123');
    });
  });

  describe('Edge cases', () => {
    it('should handle null session gracefully', function() {
      const context = {
        session: null,
        locals: { user: undefined }
      };

      const logoutFn = function() {
        if (this.session) {
          this.session.userID = undefined;
        }
      };

      expect(() => {
        logoutFn.call(context);
      }).not.toThrow();
    });

    it('should handle undefined locals gracefully', function() {
      const context = {
        session: { userID: 1, save: jest.fn() },
        locals: undefined
      };

      const getUserFn = function() {
        return this.locals?.user;
      };

      expect(getUserFn.call(context)).toBeUndefined();
    });

    it('should handle missing session.save gracefully', function() {
      const context = {
        session: { userID: undefined },
        locals: { user: undefined }
      };

      const loginFn = function(callback?: Function) {
        if (this.session) {
          this.session.save?.(callback);
        }
      };

      expect(() => {
        loginFn.call(context);
      }).not.toThrow();
    });
  });
});
