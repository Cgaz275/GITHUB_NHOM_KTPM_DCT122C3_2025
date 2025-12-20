// Mock users
export const mockUsers = {
  admin: {
    admin_user_id: 1,
    email: 'admin@test.com',
    password: 'hashed_password_here',
    status: 1,
    uuid: 'uuid-admin-123',
    fullName: 'Admin User',
    roles: 'admin'
  },
  activeUser: {
    admin_user_id: 42,
    email: 'user@example.com',
    password: 'hashed_password_user',
    status: 1,
    uuid: 'uuid-user-456',
    fullName: 'John Doe',
    roles: 'dashboard,products'
  },
  inactiveUser: {
    admin_user_id: 2,
    email: 'inactive@example.com',
    password: 'hashed_password_inactive',
    status: 0,
    uuid: 'uuid-inactive-789',
    fullName: 'Inactive User'
  },
  customer: {
    customer_id: 5,
    email: 'customer@example.com',
    password: 'hashed_password_customer',
    status: 1,
    uuid: 'uuid-customer-999',
    fullName: 'Customer User',
    roles: 'customer'
  }
};

// Mock credentials
export const mockCredentials = {
  valid: {
    email: 'admin@test.com',
    password: 'password123'
  },
  invalidEmail: {
    email: 'nonexistent@example.com',
    password: 'password123'
  },
  invalidPassword: {
    email: 'admin@test.com',
    password: 'wrongpassword'
  }
};

// Mock tokens
export const mockTokens = {
  validAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl91c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwiaWF0IjoxNjc5Njc1MjAwfQ.signature',
  validRefreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl91c2VyX2lkIjoxLCJpYXQiOjE2Nzk2NzUyMDB9.refresh_signature',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl91c2VyX2lkIjoxLCJleHAiOjE2Nzk2NzUyMDB9.expired_signature',
  invalidToken: 'invalid.token.format'
};

// Mock responses
export const mockResponses = {
  successLogin: {
    data: {
      accessToken: mockTokens.validAccessToken,
      refreshToken: mockTokens.validRefreshToken
    }
  },
  successRefresh: {
    success: true,
    data: {
      accessToken: mockTokens.validAccessToken
    }
  },
  errors: {
    invalidCredentials: {
      error: {
        status: 400,
        message: 'Invalid email or password'
      }
    },
    userNotFound: {
      error: {
        status: 401,
        message: 'Admin user not found or inactive'
      }
    },
    invalidToken: {
      error: {
        status: 401,
        message: 'Invalid refresh token'
      }
    },
    missingToken: {
      error: {
        status: 400,
        message: 'Refresh token is required'
      }
    },
    unauthorized: {
      error: {
        status: 401,
        message: 'Unauthorized'
      }
    }
  }
};

// Mock config
export const mockConfig = {
  sessionCookieNames: {
    admin: 'asid',
    frontStore: 'sid'
  },
  cookieSecrets: {
    default: 'keyboard cat'
  },
  sessionOptions: {
    resave: false,
    saveUninitialized: false,
    maxAge: 24 * 60 * 60 * 1000
  }
};

// Mock request and response objects
export const createMockRequest = (overrides = {}) => ({
  session: { userID: undefined, save: jest.fn() },
  locals: { user: undefined },
  body: {},
  getCurrentUser: jest.fn(),
  ...overrides
});

export const createMockResponse = (overrides = {}) => ({
  statusCode: 200,
  body: {},
  status: jest.fn(function(code) {
    this.statusCode = code;
    return this;
  }),
  json: jest.fn(function(data) {
    this.body = data;
    return this;
  }),
  ...overrides
});

// Mock session
export const createMockSession = (overrides = {}) => ({
  userID: undefined,
  save: jest.fn((callback) => {
    if (callback) callback();
  }),
  ...overrides
});
