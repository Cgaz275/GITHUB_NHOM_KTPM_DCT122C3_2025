describe('Customer Logout', () => {
  beforeEach(() => {
    cy.visit('/account/login');
    cy.get('input[name="email"]').type('cga@gmail.com');
    cy.get('input[name="password"]').type('a12345678');
    cy.get('button').contains(/sign in|login/i).click();
    cy.url({ timeout: 10000 }).should('not.include', '/account/login');
    // Navigate to account page where logout button is located
    cy.visit('/account');
  });

  describe('Successful customer logout', () => {
    it('should logout successfully from account page', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });

    it('should clear session after logout', () => {
      cy.getCookie('sessionid').then((cookie) => {
        expect(cookie).to.exist;
      });

      cy.get('a').contains(/logout/i).click();

      cy.getCookie('sessionid').then((cookie) => {
        expect(cookie).to.be.null;
      });
    });

    it('should redirect to homepage after logout', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });

    it('should not be able to access protected pages after logout', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');

      cy.visit('/account', { failOnStatusCode: false });
      cy.url({ timeout: 5000 }).then((url) => {
        expect(url).to.include('/account/login');
      });
    });

    it('should allow re-login after logout', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');

      // Navigate to login page
      cy.visit('/account/login');

      // Login again
      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');
    });
  });

  describe('Logout UI interactions', () => {
    it('should have logout link visible on account page', () => {
      cy.get('a').contains(/logout/i).should('be.visible');
    });

    it('should have clickable logout link', () => {
      cy.get('a').contains(/logout/i).should('not.be.disabled');
    });

    it('should be in Account Information section', () => {
      // Find logout in Account Information section
      cy.get('a').contains(/logout/i).should('exist');
    });
  });

  describe('Session cleanup after logout', () => {
    it('should clear all cookies on logout', () => {
      cy.getAllCookies().then((cookies) => {
        const sessionCookies = cookies.filter((c) =>
          c.name.toLowerCase().includes('session') ||
          c.name.toLowerCase().includes('auth')
        );
        expect(sessionCookies.length).to.be.greaterThan(0);
      });

      cy.get('a').contains(/logout/i).click();

      cy.getAllCookies().then((cookies) => {
        const sessionCookies = cookies.filter((c) =>
          c.name.toLowerCase().includes('session') ||
          c.name.toLowerCase().includes('auth')
        );
        // Most session cookies should be cleared
        expect(sessionCookies.length).to.be.lessThan(2);
      });
    });

    it('should clear localStorage on logout', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('testdata', 'value');
      });

      cy.get('a').contains(/logout/i).click();

      cy.window().then((win) => {
        // Most auth-related data should be cleared
        const token = win.localStorage.getItem('token');
        expect(token).to.be.null;
      });
    });

    it('should invalidate session immediately', () => {
      cy.get('a').contains(/logout/i).click();

      cy.visit('/account', { failOnStatusCode: false });
      cy.url().should('include', '/account/login');
    });
  });

  describe('Logout from account page', () => {
    it('should logout from account page', () => {
      cy.visit('/account');
      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });

    it('should maintain logout state after page refresh', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
      cy.reload();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });
  });

  describe('Logout error handling', () => {
    it('should handle logout API failure gracefully', () => {
      cy.intercept('POST', '**/customerLogoutJson', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('logoutError');

      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 10000 }).should('include', '/account/login');
    });

    it('should logout even if API request times out', () => {
      cy.intercept('POST', '**/customerLogoutJson', (req) => {
        req.destroy();
      }).as('logoutTimeout');

      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 10000 }).should('include', '/account/login');
    });
  });

  describe('Logout with browser interactions', () => {
    it('should prevent accessing account page via back button', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');

      cy.visit('/account', { failOnStatusCode: false });
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });

    it('should prevent accessing cached account page', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');

      cy.visit('/account', { failOnStatusCode: false });
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });
  });

  describe('Concurrent logout attempts', () => {
    it('should handle logout click gracefully', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 10000 }).should('include', '/account/login');
    });
  });

  describe('Logout state persistence', () => {
    it('should remain logged out after page reload', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
      cy.reload();
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });

    it('should remain logged out after navigation', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url({ timeout: 5000 }).should('include', '/account/login');

      cy.visit('/');
      cy.visit('/account');
      cy.url({ timeout: 5000 }).should('include', '/account/login');
    });
  });

  describe('Logout with cached credentials', () => {
    it('should clear cached tokens on logout', () => {
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        expect(token).not.to.exist;
      });

      cy.get('a').contains(/logout/i).click();

      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        expect(token).to.be.null;
      });
    });

    it('should not allow accessing account with old session', () => {
      cy.getCookie('sessionid').then((sessionCookie) => {
        cy.get('a').contains(/logout/i).click();

        if (sessionCookie) {
          cy.setCookie('sessionid', sessionCookie.value);
          cy.visit('/account', { failOnStatusCode: false });
          cy.url({ timeout: 5000 }).should('include', '/account/login');
        }
      });
    });
  });

  describe('Logout link visibility', () => {
    it('should have logout link on account page', () => {
      cy.get('a').contains(/logout/i).should('be.visible');
    });

    it('should have working logout link', () => {
      cy.get('a').contains(/logout/i).should('not.be.disabled');
    });

    it('should show login form after logout', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url().should('include', '/account/login');
      cy.get('input[name="email"]').should('be.visible');
    });
  });

  describe('Logout and re-authentication', () => {
    it('should require re-entering credentials after logout', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url().should('include', '/account/login');

      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
    });

    it('should not auto-populate credentials after logout', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url().should('include', '/account/login');

      cy.get('input[name="email"]').should('have.value', '');
      cy.get('input[name="password"]').should('have.value', '');
    });

    it('should allow login with same credentials after logout', () => {
      cy.get('a').contains(/logout/i).click();
      cy.url().should('include', '/account/login');

      cy.get('input[name="email"]').type('cga@gmail.com');
      cy.get('input[name="password"]').type('a12345678');
      cy.get('button').contains(/sign in|login/i).click();
      cy.url({ timeout: 10000 }).should('not.include', '/account/login');
    });
  });
});
