# Cypress Auth Test Credentials Setup

## Test Admin Account

- **Email**: `alanewiston2@gmail.com`
- **Password**: `a12345678`

## Setting Up Environment Variables

### Option 1: Using Environment Variables (Recommended for Security)

Create a `.env.local` file in the project root:

```bash
# .env.local (do NOT commit this file)
CYPRESS_ADMIN_EMAIL=alanewiston2@gmail.com
CYPRESS_ADMIN_PASSWORD=a12345678
CYPRESS_BASE_URL=http://localhost:3000
```

Or set them before running tests:

```bash
# Linux/Mac
export CYPRESS_ADMIN_EMAIL=alanewiston2@gmail.com
export CYPRESS_ADMIN_PASSWORD=a12345678
npm run test:e2e:ui

# Windows (PowerShell)
$env:CYPRESS_ADMIN_EMAIL='alanewiston2@gmail.com'
$env:CYPRESS_ADMIN_PASSWORD='a12345678'
npm run test:e2e:ui
```

### Option 2: Using Test Fixtures

Credentials are also stored in `cypress/fixtures/admin.json` for direct use in tests:

```javascript
describe('Login', () => {
  it('should login with test credentials', () => {
    cy.fixture('admin').then(admin => {
      cy.adminLogin(admin.validAdmin.email, admin.validAdmin.password);
    });
  });
});
```

## Using Credentials in Tests

### Method 1: Using Admin Login Command

```javascript
// Uses credentials from environment or defaults
cy.adminLogin();

// Or override with custom credentials
cy.adminLogin('different@email.com', 'password123');
```

### Method 2: Using Fixture Data

```javascript
cy.fixture('admin').then(data => {
  cy.fillLoginForm(data.validAdmin.email, data.validAdmin.password);
  cy.submitLoginForm();
});
```

### Method 3: Using Environment Variables Directly

```javascript
const email = Cypress.env('TEST_ADMIN_EMAIL') || 'alanewiston2@gmail.com';
const password = Cypress.env('TEST_ADMIN_PASSWORD') || 'a12345678';
cy.adminLogin(email, password);
```

## Running Tests with Credentials

### Interactive Mode
```bash
npm run test:e2e:ui
# Tests will automatically use credentials from:
# 1. Environment variables (CYPRESS_ADMIN_EMAIL, CYPRESS_ADMIN_PASSWORD)
# 2. Fixture files (cypress/fixtures/admin.json)
# 3. Default values in code
```

### Headless Mode
```bash
npm run test:e2e
```

### With Custom Environment
```bash
CYPRESS_ADMIN_EMAIL=custom@email.com CYPRESS_ADMIN_PASSWORD=custompass npm run test:e2e
```

## Security Best Practices

1. **Never commit .env.local files** - Already configured in `.gitignore`

2. **Use environment variables for sensitive data** - Credentials should not be hardcoded in test files

3. **Rotate test credentials regularly** - Update password if account is compromised

4. **Use separate test accounts** - Don't use production admin accounts for testing

5. **Mask credentials in logs** - Cypress automatically redacts sensitive data in videos/screenshots

6. **CI/CD Integration** - Set environment variables in CI/CD platform settings:
   
   ```yaml
   # GitHub Actions example
   env:
     CYPRESS_ADMIN_EMAIL: ${{ secrets.CYPRESS_ADMIN_EMAIL }}
     CYPRESS_ADMIN_PASSWORD: ${{ secrets.CYPRESS_ADMIN_PASSWORD }}
   ```

## Troubleshooting

### Credentials Not Found
- Check that `.env.local` exists and is properly formatted
- Verify environment variables are set: `echo $CYPRESS_ADMIN_EMAIL`
- Check `cypress/fixtures/admin.json` has correct credentials

### Login Tests Failing
- Verify the email and password are correct for the application
- Check that the login endpoint is accessible
- Ensure browser can reach `http://localhost:3000`
- Check browser console for CORS or other errors

### Permission Denied After Login
- Verify the test account has admin role/permissions
- Check that the account status is "active" in the database
- Review admin user table for the account details

## Resetting Test Account

If the test account becomes locked or unusable:

1. Contact the admin user: `alanewiston2@gmail.com`
2. Or create a new test account and update:
   - `cypress/fixtures/admin.json`
   - Environment variables
   - CI/CD secrets (if applicable)

## Example: Complete Login Test

```javascript
describe('Admin Login with Test Credentials', () => {
  beforeEach(() => {
    cy.clearAuthData();
  });

  it('should login successfully with test account', () => {
    // Method 1: Using command with default credentials
    cy.adminLogin();
    
    // Verify logged in
    cy.url().should('include', '/admin');
    cy.get('[class*="dashboard"], [class*="welcome"]').should('be.visible');
  });

  it('should login using fixture data', () => {
    cy.fixture('admin').then(admin => {
      cy.adminLogin(admin.validAdmin.email, admin.validAdmin.password);
      cy.url().should('include', '/admin');
    });
  });

  it('should logout after login', () => {
    cy.adminLogin();
    cy.adminLogout();
    cy.url().should('include', '/admin/login');
  });
});
```

## Additional Resources

- [Cypress Environment Variables Documentation](https://docs.cypress.io/guides/guides/environment-variables)
- [Cypress Best Practices for Credentials](https://docs.cypress.io/guides/references/best-practices#Logging-In)
- [OWASP Authentication Guide](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
