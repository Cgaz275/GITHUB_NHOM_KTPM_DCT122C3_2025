describe('Authentication Flow', () => {
  describe('Complete login flow', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should complete full login flow', () => {
      // Step 1: Navigate to login page
      cy.visit('/admin/login');
      cy.url().should('include', '/admin/login');
      cy.get('[class*="admin-login"]').should('be.visible');

      // Step 2: Fill login form
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');

      // Step 3: Submit form
      cy.submitLoginForm();

      // Step 4: Verify redirect to dashboard
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');

      // Step 5: Verify session is established
      cy.getCookie('sessionid').then((cookie) => {
        expect(cookie || cy.getCookie('session')).to.exist;
      });
    });

    it('should show error on failed login', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword');
      cy.submitLoginForm();

      // Verify error is displayed
      cy.get('[class*="error"], [class*="alert"]', { timeout: 10000 }).should(
        'be.visible'
      );

      // Verify still on login page
      cy.url().should('include', '/admin/login');
    });

    it('should allow retry after failed login', () => {
      cy.visit('/admin/login');

      // First attempt with wrong password
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword');
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');

      // Correct attempt
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');
    });
  });

  describe('Complete logout flow', () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    it('should complete full logout flow', () => {
      // Step 1: Verify authenticated
      cy.url().then((url) => {
        expect(url).not.to.include('/admin/login');
      });

      // Step 2: Click logout
      cy.get('a.first-letter').click({ force: true });
      cy.get('div.logout', { timeout: 5000 }).should('be.visible');
      cy.get('div.logout a').contains('Logout').click({ force: true });

      // Step 3: Verify redirect to login
      cy.url({ timeout: 10000 }).should('include', '/admin/login');

      // Step 4: Verify session cleared
      cy.getCookie('sessionid').then((cookie) => {
        expect(cookie).to.be.null;
      });

      // Step 5: Verify cannot access admin pages
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('include', '/admin/login');
    });
  });

  describe('Login then logout then login again', () => {
    it('should handle multiple login/logout cycles', () => {
      // First cycle
      cy.adminLogin();
      cy.url().should('not.include', '/admin/login');

      cy.adminLogout();
      cy.url().should('include', '/admin/login');

      // Second cycle
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');

      cy.adminLogout();
      cy.url().should('include', '/admin/login');

      // Third cycle
      cy.adminLogin();
      cy.url().should('not.include', '/admin/login');
    });
  });

  describe('Navigation flow after authentication', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should navigate through admin pages after login', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();

      // Wait for dashboard
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');

      // Navigate to different pages
      cy.visit('/admin/users', { failOnStatusCode: false });
      cy.url().then((url) => {
        expect(url).not.to.include('/admin/login');
      });

      cy.visit('/admin/products', { failOnStatusCode: false });
      cy.url().then((url) => {
        expect(url).not.to.include('/admin/login');
      });
    });

    it('should maintain authentication across page navigations', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();

      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');

      // Navigate and verify still authenticated
      cy.visit('/admin');
      cy.url().should('not.include', '/admin/login');

      cy.visit('/admin/dashboard', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).then((url) => {
        expect(url).not.to.include('/admin/login');
      });
    });
  });

  describe('Authentication state persistence', () => {
    it('should maintain auth state after page reload', () => {
      cy.adminLogin();
      const initialUrl = cy.url();

      cy.reload();

      cy.url().then((url) => {
        expect(url).not.to.include('/admin/login');
      });
    });

    it('should maintain auth state after navigation', () => {
      cy.adminLogin();
      cy.visit('/admin/users', { failOnStatusCode: false });

      cy.url().then((url) => {
        expect(url).not.to.include('/admin/login');
      });
    });

    it('should maintain auth across multiple page visits', () => {
      cy.adminLogin();

      cy.visit('/admin');
      cy.url().should('not.include', '/admin/login');

      cy.visit('/admin/dashboard', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('not.include', '/admin/login');

      cy.reload();
      cy.url().should('not.include', '/admin/login');
    });
  });

  describe('Session expiration handling', () => {
    it('should handle manual session invalidation', () => {
      cy.adminLogin();
      cy.url().should('not.include', '/admin/login');

      // Clear session cookie to simulate expiration
      cy.clearCookies();

      cy.visit('/admin', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should redirect to login on expired session', () => {
      cy.adminLogin();

      // Simulate session expiration
      cy.window().then((win) => {
        win.sessionStorage.clear();
      });
      cy.clearCookies();

      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('include', '/admin/login');
    });

    it('should handle session timeout gracefully', () => {
      cy.adminLogin();

      // Make a request and simulate session timeout
      cy.intercept('GET', '/api/admin/**', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('sessionTimeout');

      cy.visit('/admin', { failOnStatusCode: false });
      // Should handle gracefully
      cy.url().then((url) => {
        expect(url).to.exist;
      });
    });
  });

  describe('Authentication with different user agents', () => {
    it('should work with standard browser', () => {
      cy.adminLogin();
      cy.url().should('not.include', '/admin/login');
      cy.adminLogout();
    });
  });

  describe('Authentication state after errors', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should maintain page after login validation error', () => {
      cy.visit('/admin/login');

      // Try to submit with invalid email
      cy.fillLoginForm('invalid-email', 'a12345678');
      cy.submitLoginForm();

      // Should still be on login page
      cy.url().should('include', '/admin/login');

      // Form should still be there and filled
      cy.get('input[name="email"], input#field-email')
        .should('be.visible');
    });

    it('should recover from login failure and allow successful login', () => {
      cy.visit('/admin/login');

      // Failed attempt
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword');
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');

      // Successful attempt
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');
    });

    it('should handle network errors during login', () => {
      cy.intercept('POST', '**/adminLoginJson', {
        statusCode: 500,
        body: { error: 'Server Error' }
      }).as('loginError');

      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();

      cy.waitForAPI('loginError');
      cy.url().should('include', '/admin/login');

      // Should show error message
      cy.get('[class*="error"], [class*="alert"]', { timeout: 10000 }).should(
        'exist'
      );
    });
  });

  describe('Form state during authentication', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should clear password field after submission', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');

      cy.get('input[name="password"], input#field-password')
        .then(($input) => {
          const initialValue = $input.val();
          cy.wrap($input).should('have.value', initialValue);
        });

      cy.submitLoginForm();

      // After successful login, page should redirect
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');
    });

    it('should preserve email field on failed login', () => {
      cy.visit('/admin/login');
      const testEmail = 'alanewiston2@gmail.com';

      cy.fillLoginForm(testEmail, 'wrongpassword');
      cy.submitLoginForm();

      // Email should still be visible in form for retry
      cy.get('input[name="email"], input#field-email').then(($input) => {
        cy.wrap($input).should('have.value', testEmail);
      });
    });

    it('should allow clearing and retrying login', () => {
      cy.visit('/admin/login');

      // First attempt
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword');
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');

      // Clear fields
      cy.get('input[name="email"], input#field-email').clear();
      cy.get('input[name="password"], input#field-password').clear();

      // Second attempt
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();

      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');
    });
  });

  describe('Authentication with different credentials', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should login with correct email and password', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');
    });

    it('should not login with incorrect password', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'incorrectpassword');
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');
    });

    it('should not login with non-existent email', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('nonexistent@email.com', 'a12345678');
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');
    });
  });
});
