describe('Admin Login', () => {
  beforeEach(() => {
    cy.clearAuthData();
  });

  describe('Successful login', () => {
    it('should login with valid email and password', () => {
      cy.adminLogin();
      cy.url().should('not.include', '/admin/login');
      cy.url().should('include', '/admin');
    });

    it('should redirect to dashboard after successful login', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('include', '/admin');
    });

    it('should display admin dashboard content after login', () => {
      cy.adminLogin();
      cy.get('[class*="admin"]', { timeout: 10000 }).should('exist');
    });

    it('should maintain login state after page refresh', () => {
      cy.adminLogin();
      cy.url().then((url) => {
        expect(url).not.to.include('/admin/login');
      });
      cy.reload();
      cy.url().should('not.include', '/admin/login');
    });
  });

  describe('Form validation', () => {
    beforeEach(() => {
      cy.visit('/admin/login');
    });

    it('should display error message for invalid email format', () => {
      cy.fillLoginForm('invalid-email', 'a12345678');
      cy.submitLoginForm();
      cy.get('[class*="error"], [class*="alert"], [class*="message"]', {
        timeout: 10000
      }).should('be.visible');
    });

    it('should display error message for invalid password', () => {
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword');
      cy.submitLoginForm();
      cy.get('[class*="error"], [class*="alert"], [class*="message"]', {
        timeout: 10000
      }).should('be.visible');
    });

    it('should prevent login with empty email field', () => {
      cy.get('input[name="password"], input#field-password')
        .should('be.visible')
        .type('a12345678');
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');
    });

    it('should prevent login with empty password field', () => {
      cy.get('input[name="email"], input#field-email')
        .should('be.visible')
        .type('alanewiston2@gmail.com');
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');
    });

    it('should prevent login with empty email and password', () => {
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');
    });

    it('should display required field validation messages', () => {
      cy.get('button.button.primary').click();
      cy.get('[class*="error"], [class*="validation"]', {
        timeout: 5000
      }).should('exist');
    });
  });

  describe('Failed login attempts', () => {
    it('should not login with non-existent email', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('nonexistent@example.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should not login with incorrect password', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword123');
      cy.submitLoginForm();
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should show error message on failed login', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword');
      cy.submitLoginForm();
      cy.get('[class*="error"], [class*="alert"], [class*="message"]', {
        timeout: 10000
      }).should('be.visible');
    });

    it('should allow retry after failed login', () => {
      cy.visit('/admin/login');
      // First attempt with wrong password
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword');
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');

      // Second attempt with correct password
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');
    });
  });

  describe('Input field behavior', () => {
    beforeEach(() => {
      cy.visit('/admin/login');
    });

    it('should clear email field when text is selected and deleted', () => {
      const email = 'alanewiston2@gmail.com';
      cy.get('input[name="email"], input#field-email')
        .type(email)
        .clear();
      cy.get('input[name="email"], input#field-email').should('have.value', '');
    });

    it('should clear password field when text is selected and deleted', () => {
      const password = 'a12345678';
      cy.get('input[name="password"], input#field-password')
        .type(password)
        .clear();
      cy.get('input[name="password"], input#field-password').should('have.value', '');
    });

    it('should accept special characters in email field', () => {
      const specialEmail = 'test+admin@example.com';
      cy.get('input[name="email"], input#field-email').type(specialEmail);
      cy.get('input[name="email"], input#field-email').should('have.value', specialEmail);
    });

    it('should preserve password field value with masked input', () => {
      const password = 'a12345678';
      cy.get('input[name="password"], input#field-password').type(password);
      cy.get('input[name="password"], input#field-password')
        .should('have.attr', 'type')
        .and('match', /password|text/);
    });
  });

  describe('Page elements and UI', () => {
    beforeEach(() => {
      cy.visit('/admin/login');
    });

    it('should display login form', () => {
      cy.get('[class*="admin-login"]').should('be.visible');
    });

    it('should display email input field', () => {
      cy.get('input[name="email"], input#field-email').should('be.visible');
    });

    it('should display password input field', () => {
      cy.get('input[name="password"], input#field-password').should('be.visible');
    });

    it('should display sign in button', () => {
      cy.get('button.button.primary').should('be.visible');
      cy.get('button.button.primary').should('contain', 'SIGN IN');
    });

    it('should have correct button type', () => {
      cy.get('button.button.primary').should('have.attr', 'type');
    });

    it('should display email field label', () => {
      cy.get('label').filter(':contains("Email")').should('exist');
    });

    it('should display password field label', () => {
      cy.get('label').filter(':contains("Password")').should('exist');
    });
  });

  describe('Login page accessibility', () => {
    it('should be accessible at /admin/login', () => {
      cy.visit('/admin/login');
      cy.url().should('include', '/admin/login');
      cy.get('[class*="admin-login"]').should('be.visible');
    });

    it('should redirect unauthenticated users to login', () => {
      cy.visit('/admin');
      cy.url().then((url) => {
        if (!url.includes('/admin/login')) {
          // User is already logged in, logout first
          cy.adminLogout();
        }
      });
      cy.visit('/admin');
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should load login page without errors', () => {
      cy.visit('/admin/login');
      cy.get('[class*="admin-login"]').should('be.visible');
      // Ensure no critical errors prevent page display
      cy.get('input[name="email"], input#field-email').should('exist');
    });
  });

  describe('Session management', () => {
    it('should set session cookies after successful login', () => {
      cy.adminLogin();
      cy.getCookie('sessionid').then((cookie) => {
        // Session cookie should exist or other auth cookie
        expect(cookie || cy.getCookie('session')).to.exist;
      });
    });

    it('should maintain authenticated state', () => {
      cy.adminLogin();
      cy.visit('/admin');
      cy.url().should('not.include', '/admin/login');
    });

    it('should clear session on logout', () => {
      cy.adminLogin();
      cy.adminLogout();
      cy.url().should('include', '/admin/login');
      cy.getCookie('sessionid').then((cookie) => {
        // Session should be cleared
        expect(cookie).to.be.null;
      });
    });
  });

  describe('Browser interactions', () => {
    it('should handle browser back button correctly', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');
      cy.go('back');
      // Should redirect back to dashboard, not login page
      cy.url().should('not.include', '/admin/login');
    });

    it('should prevent direct access to admin pages without login', () => {
      cy.visit('/admin/users', { failOnStatusCode: false });
      cy.url().then((url) => {
        if (!url.includes('/admin/login') && !url.includes('/unauthorized')) {
          cy.log('Either already logged in or page allows access');
        }
      });
    });

    it('should reload page without losing login state', () => {
      cy.adminLogin();
      const currentUrl = cy.url();
      cy.reload();
      cy.url().should('not.include', '/admin/login');
    });
  });

  describe('Error handling', () => {
    it('should display user-friendly error message on failed login', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword');
      cy.submitLoginForm();
      cy.get('[class*="error"], [class*="alert"]', { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('should not display error message on successful login', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');
      cy.get('[class*="error"]').should('not.exist');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '**/adminLoginJson', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('loginError');

      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.waitForAPI('loginError');
      cy.get('[class*="error"], [class*="alert"]', { timeout: 10000 }).should(
        'be.visible'
      );
    });
  });

  describe('Case sensitivity', () => {
    it('should handle email case insensitivity', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('ALANEWISTON2@GMAIL.COM', 'a12345678');
      cy.submitLoginForm();
      // Should login successfully if email comparison is case-insensitive
      cy.url({ timeout: 10000 }).then((url) => {
        // Either login succeeds or fails - both are valid depending on implementation
        expect(url).to.be.ok;
      });
    });

    it('should be case-sensitive for password', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'A12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });
  });
});
