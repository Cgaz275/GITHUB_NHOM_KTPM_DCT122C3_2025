# Authentication API Tests

This directory contains comprehensive Cypress API tests for the EverShop authentication module.

## Test Files

### 1. `api-auth.cy.js`
Comprehensive tests for core authentication API endpoints.

**Test Coverage:**
- **POST /api/auth/generateToken** - User login and token generation
  - Valid credentials
  - Invalid email/password
  - Missing fields
  - Invalid email formats
  - SQL injection attempts
  - XSS attempts
  - Token consistency and format
  - Security validations

- **POST /api/auth/refreshUserToken** - Token refresh
  - Valid refresh token
  - Invalid/missing tokens
  - Malformed tokens
  - Token generation consistency
  - JWT format validation
  - Null/empty token handling

- **GET /api/auth/getCurrentUser** - Get current user information
  - Valid access token
  - Missing/invalid authorization
  - Malformed headers
  - Refresh token vs access token
  - Data consistency across requests
  - User status verification

- **Integration Tests**
  - Complete authentication flow (login → refresh → get user)
  - Token expiration and refresh scenarios
  - Post-logout behavior
  - Performance benchmarks (< 5s for login, < 3s for other operations)

### 2. `admin-auth.cy.js`
Admin-specific authentication tests.

**Test Coverage:**
- **POST /api/auth/adminLoginJson** - Admin login endpoint
  - Valid admin credentials
  - Invalid credentials
  - Empty credentials
  - SQL injection attempts
  - XSS attempts
  - Email case sensitivity
  - Input validation (length, whitespace, null values)

- **POST /api/auth/adminLogoutJson** - Admin logout endpoint
  - Authenticated logout
  - Logout without authentication
  - Session clearing after logout

- **Admin Session Validation**
  - Active session verification
  - Session data completeness
  - Admin user ID presence
  - Admin status validation

- **Security Tests**
  - Sensitive information exposure
  - Password in responses
  - Unhashed credentials
  - Token format validation
  - Different tokens per login
  - Rate limiting

- **Edge Cases**
  - Email case sensitivity
  - Whitespace handling
  - Very long inputs
  - Null/undefined values
  - Unexpected fields in requests

## Running the Tests

### Run all auth tests
```bash
npm run test:e2e -- --spec "cypress/e2e/auth/*.cy.js"
```

### Run specific test file
```bash
npm run test:e2e -- --spec "cypress/e2e/auth/api-auth.cy.js"
npm run test:e2e -- --spec "cypress/e2e/auth/admin-auth.cy.js"
```

### Run tests in headless mode
```bash
npm run test:e2e:headless -- --spec "cypress/e2e/auth/*.cy.js"
```

### Run specific test suite
```bash
npm run test:e2e -- --spec "cypress/e2e/auth/api-auth.cy.js" --grep "POST /api/auth/generateToken"
```

## Test Configuration

### Environment Variables
Tests use these environment variables (can be set in `.env` or via CLI):
- `CYPRESS_BASE_URL` - Application base URL (default: `http://localhost:3000`)
- `TEST_ADMIN_EMAIL` - Admin email for tests (default: `alanewiston2@gmail.com`)
- `TEST_ADMIN_PASSWORD` - Admin password for tests (default: `a12345678`)

### Fixtures
Test data is defined in `cypress/fixtures/admin.json`:
- Valid admin credentials
- Invalid credentials for error testing
- SQL injection payloads
- XSS payloads
- Email format variations
- Password strength examples

## API Endpoints Tested

### Authentication
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/generateToken` | POST | Generate access and refresh tokens |
| `/api/auth/refreshUserToken` | POST | Refresh expired access token |
| `/api/auth/getCurrentUser` | GET | Get current authenticated user info |
| `/api/auth/adminLoginJson` | POST | Admin-specific login endpoint |
| `/api/auth/adminLogoutJson` | POST | Admin-specific logout endpoint |

## Test Assertions

### Success Cases
- Status code 200
- Required response fields present
- Token format validation (JWT with 3 parts)
- User data consistency
- Performance within acceptable limits

### Error Cases
- Status codes: 400, 401, 404, 422, 429, 500
- Error message presence
- No sensitive data exposure
- Proper validation error messages

### Security
- SQL injection rejection
- XSS payload rejection
- Password not in responses
- No database info in errors
- Token consistency per request
- Rate limiting responses

## Common Test Patterns

### API Request with Authentication
```javascript
cy.request({
  method: 'GET',
  url: `${apiBaseUrl}/auth/getCurrentUser`,
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
}).then((response) => {
  expect(response.status).to.equal(200);
});
```

### Testing Invalid Input
```javascript
cy.request({
  method: 'POST',
  url: `${apiBaseUrl}/auth/generateToken`,
  body: {
    email: 'invalid',
    password: 'wrong'
  },
  failOnStatusCode: false
}).then((response) => {
  expect(response.status).to.be.oneOf([400, 401, 422, 500]);
});
```

### Performance Testing
```javascript
const startTime = Date.now();
cy.request(/* ... */).then(() => {
  const duration = Date.now() - startTime;
  expect(duration).to.be.lessThan(5000);
});
```

## Debugging Tests

### View request/response details
```bash
npm run test:e2e -- --spec "cypress/e2e/auth/api-auth.cy.js" --headed
```

### Enable verbose logging
```javascript
cy.request({
  /* ... */
}).then((response) => {
  cy.log(JSON.stringify(response.body, null, 2));
});
```

### Check API responses
Enable Network tab in Cypress UI to inspect actual API calls and responses.

## Continuous Integration

Tests are automatically run in CI/CD pipeline on:
- Push to `main` branch
- Pull requests to `main`
- Scheduled nightly runs

Pipeline config: `.github/workflows/ci.yml`

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Fixtures Over Hardcoding**: Use `cypress/fixtures/admin.json` for test data
3. **Clear Assertions**: Use descriptive test names and clear expectations
4. **Error Handling**: Test both success and failure paths
5. **Performance**: Include timing checks for critical operations
6. **Security**: Include injection and XSS tests
7. **Consistency**: Follow existing test patterns and naming conventions

## Troubleshooting

### "Test timed out"
- Increase `timeout` in request options
- Check if API is responding
- Verify base URL configuration

### "Authorization failed"
- Verify token is valid (not expired)
- Check token format (should be JWT with 3 parts)
- Ensure `Bearer ` prefix in Authorization header

### "401 Unauthorized"
- Generate fresh token before test
- Verify test credentials are correct
- Check if user account is active

### "API not found (404)"
- Verify endpoint paths are correct
- Check if API middleware is properly loaded
- Ensure base URL is correct

## Contributing

When adding new auth API tests:
1. Add tests to appropriate file (api-auth.cy.js or admin-auth.cy.js)
2. Follow existing naming conventions
3. Include both success and failure cases
4. Add security tests for new endpoints
5. Update this README with new endpoint info
6. Ensure tests are independent and can run in any order

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [API Testing with Cypress](https://docs.cypress.io/guides/end-to-end-testing/working-with-backend-apis)
- [Authentication Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
