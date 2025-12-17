# Cypress Auth Testing - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Your Test Credentials
- **Email**: `alanewiston2@gmail.com`
- **Password**: `a12345678`

### Step 1: Ensure EverShop is Running
```bash
# Terminal 1: Start EverShop application
npm run dev
# Should be accessible at http://localhost:3000
```

### Step 2: Open Cypress Test Runner
```bash
# Terminal 2: Open Cypress UI
npm run test:e2e:ui
```

This opens an interactive test runner where you can:
- See all available tests
- Run individual tests
- Watch them execute in real-time
- Inspect failures with screenshots

### Step 3: Select and Run Auth Tests

In the Cypress UI:
1. Look for `cypress/e2e/auth/` folder
2. Click on any test file, e.g., `admin-login.cy.js`
3. Watch the test run in the browser panel
4. See results and debug any failures

## 📋 Common Commands

```bash
# Open interactive Cypress UI (best for development)
npm run test:e2e:ui

# Run all tests in headless mode (for CI/CD)
npm run test:e2e

# Run all tests in headless mode
npm run test:e2e:headless

# Run specific auth test file
npx cypress run --spec "cypress/e2e/auth/admin-login.cy.js"

# Run tests in specific browser
npx cypress run --browser chrome
npx cypress run --browser firefox

# Run with custom environment variables
CYPRESS_ADMIN_EMAIL=your@email.com CYPRESS_ADMIN_PASSWORD=yourpass npm run test:e2e:ui
```

## 🧪 Available Test Suites

### Admin Login Tests
```bash
npx cypress run --spec "cypress/e2e/auth/admin-login.cy.js"
```
Tests:
- Form validation
- Invalid credentials handling
- SQL injection prevention
- Password masking
- Loading states
- Successful login and redirect

### Admin Logout Tests
```bash
npx cypress run --spec "cypress/e2e/auth/admin-logout.cy.js"
```
Tests:
- Logout button visibility
- Session clearing
- Redirect to login
- Cookie cleanup

### Token Management Tests
```bash
npx cypress run --spec "cypress/e2e/auth/token-management.cy.js"
```
Tests:
- Token generation
- Token storage
- Token refresh
- Token expiration
- Authorization headers

### Protected Pages Tests
```bash
npx cypress run --spec "cypress/e2e/auth/protected-pages.cy.js"
```
Tests:
- Redirect unauthenticated users to login
- Access control validation
- Session expiration handling
- Role-based access

## 🔧 Setting Up Environment Variables (Optional)

For automatic credential loading, create `.env.local`:

```bash
# Create file in project root
echo 'CYPRESS_ADMIN_EMAIL=alanewiston2@gmail.com' > .env.local
echo 'CYPRESS_ADMIN_PASSWORD=a12345678' >> .env.local
```

Or set them in your shell:

```bash
# Linux/Mac
export CYPRESS_ADMIN_EMAIL=alanewiston2@gmail.com
export CYPRESS_ADMIN_PASSWORD=a12345678

# Windows (PowerShell)
$env:CYPRESS_ADMIN_EMAIL='alanewiston2@gmail.com'
$env:CYPRESS_ADMIN_PASSWORD='a12345678'
```

## 📊 What Gets Tested

✅ **Authentication Module Tests Include:**
- Login form validation
- Error message display
- Successful authentication flow
- Token generation and storage
- Logout functionality
- Session management
- Protected page access
- Unauthorized access handling
- SQL injection prevention
- XSS prevention

## 📁 Project Structure

```
DOAN/EVERSHOP/ShoesStore_Evershop/
├── cypress/
│   ├── e2e/auth/                    # Your auth tests
│   │   ├── admin-login.cy.js
│   │   ├── admin-logout.cy.js
│   │   ├── token-management.cy.js
│   │   └── protected-pages.cy.js
│   ├── fixtures/                    # Test data
│   │   ├── admin.json              # Contains your credentials
│   │   └── tokens.json
│   ├── support/
│   │   ├── commands.js             # Reusable commands
│   │   └── e2e.js                  # Setup & hooks
│   ├── .env.example                # Environment variable template
│   ├── AUTH_CREDENTIALS.md         # Detailed credential guide
│   └── README.md                   # Full documentation
├── cypress.config.js               # Cypress configuration
└── CYPRESS_QUICKSTART.md          # This file
```

## 🐛 Debugging Tests

### View Test in Slow Motion
```bash
npx cypress run --slow-mo=500
```

### Debug Specific Test
```bash
npx cypress open
# Then click on the test you want to debug
```

### Print to Console
```javascript
cy.log('My debug message');
cy.get('selector').then($el => console.log($el));
```

### Take Screenshots
```javascript
cy.screenshot('my-screenshot-name');
```

## ✅ First Test Run Checklist

- [ ] EverShop app is running on `http://localhost:3000`
- [ ] Admin credentials are set (email: `alanewiston2@gmail.com`, password: `a12345678`)
- [ ] You can manually login to `/admin` with these credentials
- [ ] Run `npm run test:e2e:ui` to open Cypress
- [ ] Select an auth test (e.g., `admin-login.cy.js`)
- [ ] Watch the test execute

## 🔍 What Happens During Login Test

1. Navigate to `/admin/login`
2. Fill email field with `alanewiston2@gmail.com`
3. Fill password field with `a12345678`
4. Click "SIGN IN" button
5. Wait for redirect away from `/login` page
6. Verify successful login

## 📝 Test Output Example

```
✓ should display admin login page
✓ should display login form with email field
✓ should display login form with password field
✓ should display login submit button
✓ should validate empty email field
✓ should validate empty password field
✓ should display error for invalid credentials
✓ should redirect to dashboard on successful login
✓ should login using test account credentials
✓ should persist login session

9 passing (45s)
```

## 🚨 Common Issues & Fixes

### "Cannot find element" Error
- Verify EverShop is running on `http://localhost:3000`
- Check if login page loads: Visit `http://localhost:3000/admin/login` manually
- Inspect element names match the test (e.g., `input[name="email"]`)

### "Invalid email or password" Error
- Verify credentials are correct: `alanewiston2@gmail.com` / `a12345678`
- Check if account is active in the database
- Try logging in manually through the web interface

### Tests Timeout
- Increase timeout in tests: `cy.get('selector', { timeout: 15000 })`
- Or edit `cypress.config.js`: `defaultCommandTimeout: 15000`

### CORS or Network Errors
- Ensure EverShop backend is running
- Check if API endpoints are accessible
- Look at browser console for specific errors

## 💡 Pro Tips

1. **Use Cypress UI for Development**
   - Better debugging experience
   - See tests fail/pass in real-time
   - Can pause and inspect elements

2. **Use Headless Mode for CI/CD**
   - Faster execution
   - Better for automation
   - Generates videos/screenshots on failure

3. **Run Tests During Development**
   - Catch regressions early
   - Verify auth changes don't break tests
   - Build confidence in code changes

4. **Add More Tests as You Go**
   - Test edge cases
   - Test error scenarios
   - Test security issues

## 📚 More Information

For detailed information about:
- **Credentials & Security**: See `cypress/AUTH_CREDENTIALS.md`
- **Complete Documentation**: See `cypress/README.md`
- **Module Structure**: Check `packages/evershop/src/modules/auth/`

## 🤝 Next Steps

1. ✅ Run first test: `npm run test:e2e:ui`
2. ✅ Watch a successful login test
3. ✅ Try running different test suites
4. ✅ Add your own auth tests
5. ✅ Integrate into CI/CD pipeline

## 📞 Need Help?

- **Cypress Docs**: https://docs.cypress.io/
- **EverShop Docs**: Check README in project root
- **Auth Module Code**: `packages/evershop/src/modules/auth/`
- **Test Files**: `cypress/e2e/auth/`

---

Happy testing! 🎉
