# Cypress E2E Tests for EverShop Auth Module

This directory contains end-to-end (E2E) tests for the authentication module in EverShop's `modules/auth` branch.

## 📋 Quick Start

### Prerequisites
- Node.js 14+ installed
- EverShop application running on `http://localhost:3000`
- Dev environment set up with `npm install`

### Running Tests

#### Open Cypress Test Runner UI
```bash
npm run test:e2e:ui
```

#### Run All Auth Tests
```bash
npm run test:e2e
```

#### Run Specific Auth Test Suite
```bash
npx cypress run --spec "cypress/e2e/auth/admin-login.cy.js"
npx cypress run --spec "cypress/e2e/auth/admin-logout.cy.js"
npx cypress run --spec "cypress/e2e/auth/token-management.cy.js"
npx cypress run --spec "cypress/e2e/auth/protected-pages.cy.js"
```

#### Run Tests in Headless Mode
```bash
npm run test:e2e:headless
```

#### Run Tests in Different Browser
```bash
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge
```

## 📁 Directory Structure

```
cypress/
├── e2e/
│   └── auth/                          # Authentication tests
│       ├── admin-login.cy.js         # Admin login form & validation
│       ├── admin-logout.cy.js        # Admin logout functionality
│       ├── token-management.cy.js    # JWT token lifecycle
│       └── protected-pages.cy.js     # Access control & redirects
├── fixtures/                          # Test data
│   ├── admin.json                    # Admin credentials & test data
│   └── tokens.json                   # Token payloads & samples
├── support/                           # Test support files
│   ├── e2e.js                        # E2E setup & hooks
│   └── commands.js                   # Custom auth commands
├── videos/                            # Test recordings (generated)
├── screenshots/                       # Failure screenshots (generated)
└── downloads/                         # Downloaded files (generated)
```

## 🧪 Test Coverage

### Admin Login Tests (`admin-login.cy.js`)
- ✅ Login page loads correctly
- ✅ Form validation (empty fields)
- ✅ Invalid credentials handling
- ✅ SQL injection prevention
- ✅ Password masking & toggle
- ✅ Email format validation
- ✅ Form submission with proper error handling
- ✅ Loading states during submission

### Admin Logout Tests (`admin-logout.cy.js`)
- ✅ Logout option visibility
- ✅ Logout button functionality
- ✅ Session clearing
- ✅ Redirect to login page
- ✅ Cookie & localStorage cleanup
- ✅ Token invalidation
- ✅ Re-login after logout

### Token Management Tests (`token-management.cy.js`)
- ✅ Access token generation on login
- ✅ Refresh token generation
- ✅ Secure token storage
- ✅ Token inclusion in API requests
- ✅ Token expiration handling
- ✅ Automatic token refresh
- ✅ 401 error handling
- ✅ Authorization header validation
- ✅ Concurrent request handling

### Protected Pages Tests (`protected-pages.cy.js`)
- ✅ Redirect to login for unauthenticated access
- ✅ Admin dashboard protection
- ✅ Admin settings protection
- ✅ Public login page accessibility
- ✅ Preserve intended destination after login
- ✅ Token validation on page load
- ✅ 401 response handling
- ✅ Role-based access control
- ✅ Forbidden resource handling (403)

## 🔧 Custom Commands

### Login Command
```javascript
cy.adminLogin('admin@evershop.io', 'password');
```

### Logout Command
```javascript
cy.adminLogout();
```

### Check Login Status
```javascript
cy.isAdminLoggedIn();
```

### Check Auth Token
```javascript
cy.checkAuthToken();
```

### Clear Auth Data
```javascript
cy.clearAuthData();
```

### Fill Login Form
```javascript
cy.fillLoginForm('email@test.com', 'password');
```

### Submit Login Form
```javascript
cy.submitLoginForm();
```

### Check Login Error
```javascript
cy.checkLoginError('Invalid email or password');
```

### Mock API Responses
```javascript
cy.mockLoginAPI();
cy.mockLogoutAPI();
cy.mockGetCurrentUserAPI();
```

### Wait for API
```javascript
cy.waitForAPI('loginRequest');
```

## 📊 Test Data

### Admin Credentials (`fixtures/admin.json`)
```json
{
  "validAdmin": {
    "email": "admin@evershop.io",
    "password": "admin"
  },
  "testAdmin": {
    "email": "test.admin@evershop.io",
    "password": "TestPassword123!"
  }
}
```

### Use Fixtures in Tests
```javascript
describe('Login', () => {
  it('should login with valid credentials', () => {
    cy.fixture('admin').then(admin => {
      cy.adminLogin(admin.validAdmin.email, admin.validAdmin.password);
    });
  });
});
```

## 🐛 Debugging

### Enable Debug Mode
```javascript
cy.debug();  // Pauses execution
cy.pause();  // Manual pause point
```

### View Network Requests
```javascript
cy.intercept('GET', '**/api/**', (req) => {
  console.log('Request:', req);
}).as('apiRequest');
cy.wait('@apiRequest').then(interception => {
  console.log('Response:', interception.response.body);
});
```

### Inspect Elements
```javascript
cy.get('selector').then($el => {
  console.log($el);
  cy.log('Element found');
});
```

### Take Screenshots
```javascript
cy.screenshot('my-screenshot');
```

## ✅ Best Practices for Auth Testing

1. **Use Data Attributes**: Always use `data-test` attributes
   ```html
   <button data-test="login-submit">Login</button>
   ```
   ```javascript
   cy.get('[data-test="login-submit"]').click();
   ```

2. **Clear Auth Before Each Test**
   ```javascript
   beforeEach(() => {
     cy.clearAuthData();
   });
   ```

3. **Test Real User Workflows**
   ```javascript
   it('should complete login flow', () => {
     cy.visit('/admin/login');
     cy.fillLoginForm('admin@test.com', 'password');
     cy.submitLoginForm();
     cy.url().should('include', '/admin');
   });
   ```

4. **Mock External APIs When Needed**
   ```javascript
   cy.mockLoginAPI();
   ```

5. **Test Security Edge Cases**
   - SQL injection attempts
   - XSS attempts
   - CSRF protection
   - Token expiration
   - Invalid credentials

6. **Verify API Headers**
   ```javascript
   cy.intercept('GET', '**/api/**', (req) => {
     expect(req.headers['authorization']).to.include('Bearer');
   });
   ```

7. **Test Token Lifecycle**
   - Token generation
   - Token storage
   - Token refresh
   - Token expiration
   - Token invalidation

## 🔒 Security Testing

### Test Cases Included
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CSRF token validation
- ✅ Password masking
- ✅ Secure token storage
- ✅ Authorization header validation
- ✅ Token expiration handling
- ✅ Session management

### Additional Security Tests to Consider
```javascript
it('should not expose tokens in URLs', () => {
  // Verify token not in query params
  cy.url().should('not.include', 'token=');
});

it('should validate token signature', () => {
  // Verify forged tokens are rejected
});

it('should enforce HTTPS for auth endpoints', () => {
  // Verify auth endpoints use HTTPS
});
```

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Cypress Auth Tests
  run: npm run test:e2e
  continue-on-error: true

- name: Upload Screenshots
  if: failure()
  uses: actions/upload-artifact@v2
  with:
    name: cypress-screenshots
    path: cypress/screenshots
```

### GitLab CI Example
```yaml
cypress-auth-tests:
  stage: test
  script:
    - npm run test:e2e
  artifacts:
    when: always
    paths:
      - cypress/screenshots
      - cypress/videos
```

## 📝 Writing New Auth Tests

### Basic Test Structure
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.clearAuthData();
    cy.visit('/admin/login');
  });

  it('should do something', () => {
    // Arrange
    cy.fixture('admin').then(admin => {
      // Act
      cy.fillLoginForm(admin.validAdmin.email, admin.validAdmin.password);
      cy.submitLoginForm();
      
      // Assert
      cy.url().should('include', '/admin');
    });
  });
});
```

### Testing Error Scenarios
```javascript
it('should handle network errors', () => {
  cy.intercept('POST', '**/api/auth/**', { forceNetworkError: true });
  cy.fillLoginForm('admin@test.com', 'password');
  cy.submitLoginForm();
  cy.get('[class*="error"]').should('contain', 'Network error');
});
```

## 🔗 Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [JWT Authentication Guide](https://jwt.io/introduction)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)

## 🤝 Contributing

When adding new auth tests:

1. Follow existing test patterns
2. Use meaningful test names
3. Include positive and negative cases
4. Test security edge cases
5. Update this README with new test coverage
6. Ensure tests are independent and idempotent

## 📞 Support

For questions or issues:
- Check existing test examples in `cypress/e2e/auth/`
- Review Cypress documentation at https://docs.cypress.io/
- Check EverShop auth module documentation in `packages/evershop/src/modules/auth/`
