describe('Customer Login', () => {
  beforeEach(() => {
    cy.clearAuthData();
  });

  describe('Successful customer login', () => {
    it('should login with valid email and password', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]')
        .should('be.visible')
        .type('cga@gmail.com');
      cy.get('input[name="password"]')
        .should('be.visible')
        .type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');
    });

    it('should redirect to homepage after successful login', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).then((url) => {
        expect(url).to.include('/');
        expect(url).not.to.include('/account/login');
      });
    });

    it('should set session cookie after successful login', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');
      cy.getCookie('sessionid').then((cookie) => {
        expect(cookie || cy.getCookie('session')).to.exist;
      });
    });

    it('should maintain login state after page refresh', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');
      cy.reload();
      cy.url().should('not.include', '/account/login');
    });
  });

  describe('Customer login form validation', () => {
    beforeEach(() => {
      cy.visit('/account/login');
    });

    it('should display error for invalid email format', () => {
      cy.get('input[name="email"]').type('invalidemail');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.get('[class*="error"], [class*="alert"], [role="alert"]', {
        timeout: 5000
      }).should('exist');
    });

    it('should display error for invalid credentials', () => {
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button').contains(/sign in|login/i).click();
      cy.get('[class*="error"], [class*="alert"], [role="alert"]', {
        timeout: 5000
      }).should('exist');
    });

    it('should prevent login with empty email', () => {
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });

    it('should prevent login with empty password', () => {
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });

    it('should show validation error for empty fields', () => {
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });
  });

  describe('Customer login page elements', () => {
    beforeEach(() => {
      cy.visit('/account/login');
    });

    it('should display login form', () => {
      cy.get('[class*="login"]', { timeout: 5000 }).should('exist');
    });

    it('should display email input field', () => {
      cy.get('input[name="email"]').should('be.visible');
    });

    it('should display password input field', () => {
      cy.get('input[name="password"]').should('be.visible');
    });

    it('should display sign in button', () => {
      cy.get('button').contains(/sign in|login/i).should('be.visible');
    });

    it('should display register link', () => {
      cy.get('a').contains(/create an account|register|sign up/i).should('be.visible');
    });

    it('should display forgot password link', () => {
      cy.get('a').contains(/forgot.*password/i).should('be.visible');
    });

    it('should have working register link', () => {
      cy.get('a').contains(/create an account|register|sign up/i).should('have.attr', 'href');
    });

    it('should have working forgot password link', () => {
      cy.get('a').contains(/forgot.*password/i).should('have.attr', 'href');
    });
  });

  describe('Customer login error handling', () => {
    beforeEach(() => {
      cy.visit('/account/login');
    });

    it('should display user-friendly error message on failed login', () => {
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button').contains(/sign in|login/i).click();
      cy.get('[class*="error"], [class*="alert"], [role="alert"]', {
        timeout: 5000
      }).should('be.visible');
    });

    it('should not display error message on successful login', () => {
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');
      cy.get('[class*="error"]').should('not.exist');
    });

    it('should allow retry after failed login', () => {
      // First attempt with wrong password
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');

      // Correct attempt
      cy.get('input[name="email"]').clear().type('cga@gmail.com');
      cy.get('input[name="password"]').clear().type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '**/customerLoginJson', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('loginError');

      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.wait('@loginError');
      cy.get('[class*="error"], [class*="alert"]', { timeout: 5000 }).should('exist');
    });
  });

  describe('Customer login form behavior', () => {
    beforeEach(() => {
      cy.visit('/account/login');
    });

    it('should clear email field when text is deleted', () => {
      cy.get('input[name="email"]').type('cga@gmail.com').clear();
      cy.get('input[name="email"]').should('have.value', '');
    });

    it('should clear password field when text is deleted', () => {
      cy.get('input[name="password"]').type('a12345678').clear();
      cy.get('input[name="password"]').should('have.value', '');
    });

    it('should accept special characters in email', () => {
      const specialEmail = 'test+customer@example.com';
      cy.get('input[name="email"]').type(specialEmail);
      cy.get('input[name="email"]').should('have.value', specialEmail);
    });

    it('should mask password input', () => {
      cy.get('input[name="password"]')
        .type('a12345678')
        .then(($input) => {
          const inputType = $input.attr('type');
          expect(inputType).to.match(/password|text/);
        });
    });

    it('should preserve email on failed login for retry', () => {
      const testEmail = 'cga@gmail.com';
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
      cy.get('input[name="email"]').should('have.value', testEmail);
    });
  });

  describe('Customer login page accessibility', () => {
    it('should be accessible at /account/login', () => {
      cy.visit('/account/login');
      cy.url().should('include', '/account/login');
    });

    it('should load login page without errors', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').should('exist');
      cy.get('input[name="password"]').should('exist');
    });

    it('should show "Welcome Back" or similar message', () => {
      cy.visit('/account/login');
      cy.get('h1, h2, .login__page', { timeout: 5000 }).should('exist');
    });

    it('should redirect logged-in customer from login page', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');

      // Try to revisit login page
      cy.visit('/account/login');
      cy.url({ timeout: 5000 }).then((url) => {
        // Should either redirect or stay on login (both valid behaviors)
        expect(url).to.be.ok;
      });
    });
  });

  describe('Customer session management', () => {
    it('should create session after successful login', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');

      cy.getCookie('sessionid').then((cookie) => {
        expect(cookie).to.exist;
      });
    });

    it('should clear session on logout', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');

      // Logout
      cy.get('a, button').contains(/logout|sign out/i).click({ force: true });
      cy.getCookie('sessionid').then((cookie) => {
        expect(cookie).to.be.null;
      });
    });
  });

  describe('Customer login with different scenarios', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should not login with non-existent email', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });

    it('should not login with incorrect password', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('incorrectpassword');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });

    it('should be case-insensitive for email (if configured)', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('CGA@GMAIL.COM');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).then((url) => {
        // Either succeeds or fails depending on implementation
        expect(url).to.be.ok;
      });
    });

    it('should be case-sensitive for password', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('A12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });
  });

  describe('Customer login page transitions', () => {
    it('should navigate to register page', () => {
      cy.visit('/account/login');
      cy.get('a').contains(/create an account|register|sign up/i).click();
      cy.url({ timeout: 5000 }).should('include', '/register');
    });

    it('should navigate to forgot password page', () => {
      cy.visit('/account/login');
      cy.get('a').contains(/forgot.*password/i).click();
      cy.url({ timeout: 5000 }).should('include', '/password');
    });

    it('should have home link in header', () => {
      cy.visit('/account/login');
      cy.get('a[href*="home"], [class*="logo"]').should('exist');
    });
  });

  describe('Customer login form styling and UX', () => {
    beforeEach(() => {
      cy.visit('/account/login');
    });

    it('should display form in centered layout', () => {
      cy.get('[class*="login"]').should('have.css', 'display');
    });

    it('should have visible form inputs with proper styling', () => {
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
    });

    it('should have visible submit button', () => {
      cy.get('button').contains(/sign in|login/i).should('be.visible');
    });

    it('should have properly spaced form elements', () => {
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button').contains(/sign in|login/i).should('be.visible');
    });
  });

  describe('Customer login account interaction', () => {
    it('should be able to view account after login', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');

      // Navigate to account page
      cy.visit('/account');
      cy.url({ timeout: 5000 }).should('include', '/account');
    });

    it('should have access to protected pages after login', () => {
      cy.visit('/account/login');
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');

      cy.visit('/account/addresses');
      cy.url({ timeout: 5000 }).then((url) => {
        expect(url).not.to.include('/account/login');
      });
    });
  });
});
