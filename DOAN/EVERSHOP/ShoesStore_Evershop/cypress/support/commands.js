/**
 * Admin Login
 * @param {string} email - Admin email (optional, uses env var if not provided)
 * @param {string} password - Admin password (optional, uses env var if not provided)
 */
Cypress.Commands.add('adminLogin', (email, password) => {
  const testEmail = email || Cypress.env('TEST_ADMIN_EMAIL') || 'alanewiston2@gmail.com';
  const testPassword = password || Cypress.env('TEST_ADMIN_PASSWORD') || 'a12345678';

  cy.visit('/admin/login', { timeout: 15000 });

  // Wait for page to load and form to be visible
  cy.get('[class*="admin-login"]', { timeout: 15000 }).should('be.visible');

  // Fill email field - use multiple selector strategies
  cy.get('input[name="email"], input#field-email', { timeout: 15000 })
    .should('be.visible')
    .clear()
    .type(testEmail, { delay: 50 });

  // Fill password field
  cy.get('input[name="password"], input#field-password', { timeout: 15000 })
    .should('be.visible')
    .clear()
    .type(testPassword, { delay: 50 });

  // Submit login form
  cy.get('button.button.primary', { timeout: 10000 })
    .should('be.visible')
    .click();

  // Wait for redirect to admin dashboard
  cy.url({ timeout: 15000 }).should('not.include', '/login');
});

/**
 * Admin Logout
 * Clicks avatar to open dropdown, then clicks logout link
 */
Cypress.Commands.add('adminLogout', () => {
  // Click avatar (first-letter class) to show logout dropdown
  cy.get('a.first-letter', { timeout: 10000 })
    .click({ force: true });

  // Wait for dropdown to appear
  cy.get('div.logout', { timeout: 5000 })
    .should('be.visible');

  // Click logout link inside dropdown using text matching
  cy.get('div.logout a')
    .contains('Logout')
    .click({ force: true });

  // Verify redirect to login page
  cy.url({ timeout: 10000 }).should('include', '/admin/login');
});

/**
 * Check if user is logged in
 */
Cypress.Commands.add('isAdminLoggedIn', () => {
  cy.visit('/admin');
  cy.url().then((url) => {
    if (url.includes('/admin/login')) {
      return false;
    }
    return true;
  });
});

/**
 * Check JWT token in localStorage/sessionStorage
 */
Cypress.Commands.add('checkAuthToken', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token') || win.sessionStorage.getItem('token');
    return !!token;
  });
});

/**
 * Clear auth data
 */
Cypress.Commands.add('clearAuthData', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearAllCookies();
});

/**
 * Mock API login response
 */
Cypress.Commands.add('mockLoginAPI', () => {
  cy.intercept('POST', '**/api/auth/**', {
    statusCode: 200,
    body: {
      data: {
        accessToken: 'mock_access_token_xyz123',
        refreshToken: 'mock_refresh_token_xyz123'
      }
    }
  }).as('loginRequest');
});

/**
 * Mock API logout response
 */
Cypress.Commands.add('mockLogoutAPI', () => {
  cy.intercept('POST', '**/api/logout/**', {
    statusCode: 200,
    body: {
      success: true
    }
  }).as('logoutRequest');
});

/**
 * Mock getCurrentUser API response
 */
Cypress.Commands.add('mockGetCurrentUserAPI', (user = null) => {
  const defaultUser = {
    admin_user_id: 1,
    email: 'admin@evershop.io',
    name: 'Admin',
    status: 1
  };
  cy.intercept('GET', '**/api/auth/user/**', {
    statusCode: 200,
    body: {
      data: user || defaultUser
    }
  }).as('getCurrentUserRequest');
});

/**
 * Fill admin login form
 */
Cypress.Commands.add('fillLoginForm', (email, password) => {
  // Fill email field - use multiple selector strategies
  cy.get('input[name="email"], input#field-email', { timeout: 10000 })
    .should('be.visible')
    .clear()
    .type(email, { delay: 50 });

  // Fill password field
  cy.get('input[name="password"], input#field-password', { timeout: 10000 })
    .should('be.visible')
    .clear()
    .type(password, { delay: 50 });
});

/**
 * Submit login form
 */
Cypress.Commands.add('submitLoginForm', () => {
  cy.get('button.button.primary', { timeout: 10000 })
    .should('be.visible')
    .click();
});

/**
 * Check login error message
 */
Cypress.Commands.add('checkLoginError', (errorMessage = null) => {
  cy.get('[class*="error"], [class*="alert"], [class*="message"]')
    .should('be.visible')
    .then(($error) => {
      if (errorMessage) {
        cy.wrap($error).should('contain', errorMessage);
      }
    });
});

/**
 * Access protected admin page
 */
Cypress.Commands.add('visitAdminPage', (path = '/admin') => {
  cy.visit(path);
  // If redirected to login, it means not authenticated
  cy.url().then((url) => {
    if (url.includes('/admin/login')) {
      cy.log('Not authenticated, at login page');
    }
  });
});

/**
 * Wait for API interceptor
 */
Cypress.Commands.add('waitForAPI', (alias, options = {}) => {
  cy.wait(`@${alias}`, { timeout: 10000, ...options });
});

/**
 * Mock account lockout after 5 failed attempts (1 minute lock)
 */
Cypress.Commands.add('mockAccountLockAPI', () => {
  cy.intercept('POST', '**/api/auth/login/**', (req) => {
    const loginAttempts = req.body.loginAttempts || 0;
    if (loginAttempts >= 5) {
      req.reply({
        statusCode: 429,
        body: {
          error: 'Account temporarily locked for 1 minute due to too many failed attempts',
          lockedUntil: new Date(Date.now() + 60 * 1000).toISOString()
        }
      });
    }
  }).as('lockoutRequest');
});

/**
 * Track login attempts in session
 */
Cypress.Commands.add('trackLoginAttempt', (email) => {
  cy.window().then((win) => {
    const attempts = win.sessionStorage.getItem(`login_attempts_${email}`) || '0';
    const count = parseInt(attempts) + 1;
    win.sessionStorage.setItem(`login_attempts_${email}`, count.toString());
    return count;
  });
});

/**
 * Get login attempt count
 */
Cypress.Commands.add('getLoginAttempts', (email) => {
  cy.window().then((win) => {
    const attempts = win.sessionStorage.getItem(`login_attempts_${email}`) || '0';
    return parseInt(attempts);
  });
});

/**
 * Reset login attempts
 */
Cypress.Commands.add('resetLoginAttempts', (email) => {
  cy.window().then((win) => {
    win.sessionStorage.removeItem(`login_attempts_${email}`);
  });
});

/**
 * Check if account is locked
 */
Cypress.Commands.add('isAccountLocked', (email) => {
  cy.window().then((win) => {
    const locked = win.sessionStorage.getItem(`account_locked_${email}`);
    return locked === 'true';
  });
});

/**
 * Lock account in session (1 minute lock)
 */
Cypress.Commands.add('lockAccount', (email) => {
  cy.window().then((win) => {
    const lockTime = new Date(Date.now() + 60 * 1000).toISOString();
    win.sessionStorage.setItem(`account_locked_${email}`, 'true');
    win.sessionStorage.setItem(`account_lock_time_${email}`, lockTime);
  });
});
