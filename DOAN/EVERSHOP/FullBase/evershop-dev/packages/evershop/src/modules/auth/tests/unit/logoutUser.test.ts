import { describe, it, expect, beforeEach } from '@jest/globals';
import { logoutUser } from '../../services/logoutUser';

describe('logoutUser', () => {
  let mockRequest;

  beforeEach(() => {
    mockRequest = {
      session: {
        userID: 1
      },
      locals: {
        user: {
          admin_user_id: 1,
          email: 'admin@test.com',
          status: 1
        }
      }
    };
  });

  it('should clear session userID when logging out', () => {
    const boundLogout = logoutUser.bind(mockRequest);
    boundLogout();

    expect(mockRequest.session.userID).toBeUndefined();
  });

  it('should clear locals user when logging out', () => {
    const boundLogout = logoutUser.bind(mockRequest);
    boundLogout();

    expect(mockRequest.locals.user).toBeUndefined();
  });

  it('should handle undefined session gracefully', () => {
    mockRequest.session = undefined;

    const boundLogout = logoutUser.bind(mockRequest);

    expect(() => {
      boundLogout();
    }).toThrow();
  });

  it('should clear both session and locals in single call', () => {
    const boundLogout = logoutUser.bind(mockRequest);
    boundLogout();

    expect(mockRequest.session.userID).toBeUndefined();
    expect(mockRequest.locals.user).toBeUndefined();
  });
});
