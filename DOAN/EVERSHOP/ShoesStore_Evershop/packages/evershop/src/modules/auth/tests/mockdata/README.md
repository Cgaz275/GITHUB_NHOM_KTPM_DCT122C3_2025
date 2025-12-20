# Mock Data for Auth Module Tests

This folder contains mock data, fixtures, and utilities used across auth module tests (unit and integration tests).

## Files

### users.json
Contains mock user objects with various states for testing:
- `adminUser`: Active admin user with full properties
- `activeUser`: Active user with specific roles
- `inactiveUser`: User with status = 0 (inactive)
- `customerUser`: Customer type user
- `userWithoutPassword`: User object without password field (after login)
- `multipleUsers`: Array of users with different IDs for testing multiple scenarios

**Used in:** loginUserWithEmail.test.ts, bootstrap.test.ts, generateToken.test.ts, refreshToken.test.ts

### credentials.json
Contains mock login credentials for testing authentication flows:
- `validCredentials`: Valid email and password combination
- `invalidEmail`: Non-existent email
- `invalidPassword`: Correct email with wrong password
- `validEmailFormats`: Array of valid email address formats
- `invalidEmailFormats`: Array of invalid email formats for validation testing
- `emailsWithSpecialChars`: Emails with special characters like `%` for SQL escape testing

**Used in:** loginUserWithEmail.test.ts, generateToken.test.ts

### tokens.json
Contains mock JWT tokens and token-related data:
- `validAccessToken`: Valid JWT access token
- `validRefreshToken`: Valid JWT refresh token
- `expiredToken`: Expired JWT token
- `invalidToken`: Malformed token
- `tokenPayloads`: Token payload examples with user data

**Used in:** generateToken.test.ts, refreshToken.test.ts

### responses.json
Contains mock API response objects:
- `successLoginResponse`: Successful login response with tokens
- `successRefreshResponse`: Successful token refresh response
- `errorResponses`: Various error response scenarios (invalid credentials, user not found, invalid token, etc.)
- `tokenTypes`: TOKEN_TYPES constants (ADMIN, CUSTOMER)

**Used in:** generateToken.test.ts, refreshToken.test.ts

### config.json
Contains mock configuration values for session management:
- `sessionConfig`: Session cookie names and secrets (default and custom values)
- `sessionOptions`: Session options like resave, saveUninitialized, maxAge
- `configKeys`: Configuration key names used in getConfig() calls

**Used in:** getAdminSessionCookieName.test.ts, getCookieSecret.test.ts, getFrontStoreSessionCookieName.test.ts, getSessionConfig.test.ts

### index.ts
TypeScript file exporting all mock data as JavaScript objects and utility functions:
- `mockUsers`: Exported user objects
- `mockCredentials`: Exported credentials
- `mockTokens`: Exported tokens
- `mockResponses`: Exported responses
- `mockConfig`: Exported configuration
- `createMockRequest()`: Factory function to create mock request objects
- `createMockResponse()`: Factory function to create mock response objects
- `createMockSession()`: Factory function to create mock session objects

**Usage in tests:**
```typescript
import { mockUsers, mockCredentials, mockTokens, createMockRequest } from '../mockdata';

describe('Test Suite', () => {
  it('should test something', () => {
    const mockRequest = createMockRequest({
      body: mockCredentials.valid
    });
    const user = mockUsers.admin;
    // ... test logic
  });
});
```

## Adding New Mock Data

When adding new test cases that require specific mock data:

1. Add the data to the appropriate JSON file (users.json, credentials.json, etc.)
2. Update the corresponding export in index.ts if using TypeScript
3. Update this README to document the new mock data
4. Reference the mock data in your test files

## Best Practices

- Keep mock data realistic and representative of actual data structures
- Use descriptive names for different scenarios (valid, invalid, inactive, etc.)
- Group related data together in JSON files
- Document each mock data section with comments
- Reuse mock data across tests to maintain consistency
- Use factory functions (createMockRequest, etc.) to generate objects with customizable defaults
