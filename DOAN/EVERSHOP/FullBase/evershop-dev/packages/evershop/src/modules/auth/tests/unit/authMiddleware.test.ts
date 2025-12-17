import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import authMiddleware from '../../api/global/[getCurrentUser]auth';

describe('Auth Middleware', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      getCurrentUser: jest.fn(),
      currentRoute: {
        id: 'dashboard',
        access: undefined
      }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  it('should allow access to public routes without authentication', async () => {
    mockRequest.currentRoute.access = 'public';
    mockRequest.getCurrentUser.mockReturnValue(null);

    await authMiddleware(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should deny access when user is not authenticated and route is private', async () => {
    mockRequest.currentRoute.access = undefined;
    mockRequest.getCurrentUser.mockReturnValue(null);

    await authMiddleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        status: 401,
        message: 'Unauthorized'
      }
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should deny access when user has no uuid', async () => {
    mockRequest.getCurrentUser.mockReturnValue({
      admin_user_id: 1,
      email: 'admin@test.com',
      uuid: undefined
    });

    await authMiddleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should allow access when user has wildcard roles', async () => {
    mockRequest.getCurrentUser.mockReturnValue({
      admin_user_id: 1,
      email: 'admin@test.com',
      uuid: 'uuid-1234',
      roles: '*'
    });

    await authMiddleware(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should allow access when user role matches required route', async () => {
    mockRequest.currentRoute.id = 'dashboard';
    mockRequest.getCurrentUser.mockReturnValue({
      admin_user_id: 1,
      email: 'admin@test.com',
      uuid: 'uuid-1234',
      roles: 'dashboard,products'
    });

    await authMiddleware(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should deny access when user role does not match required route', async () => {
    mockRequest.currentRoute.id = 'settings';
    mockRequest.getCurrentUser.mockReturnValue({
      admin_user_id: 1,
      email: 'admin@test.com',
      uuid: 'uuid-1234',
      roles: 'dashboard,products'
    });

    await authMiddleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        status: 401,
        message: 'Unauthorized'
      }
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
