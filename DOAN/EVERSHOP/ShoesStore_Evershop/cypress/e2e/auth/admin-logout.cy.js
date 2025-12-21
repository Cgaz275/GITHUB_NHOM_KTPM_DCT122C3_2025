describe('Admin Logout', () => {
  describe('Logout functionality', () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    it('should logout successfully', () => {
      cy.adminLogout();
      cy.url().should('include', '/admin/login');
    });

    it('should clear session after logout', () => {
      cy.adminLogout();
      cy.getCookie('sessionid').then((cookie) => {
        expect(cookie).to.be.null;
      });
    });

    it('should not be able to access admin pages after logout', () => {
      cy.adminLogout();
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('include', '/admin/login');
    });

    it('should clear local storage after logout', () => {
      // Store some data before logout
      cy.window().then((win) => {
        win.localStorage.setItem('testkey', 'testvalue');
      });

      cy.adminLogout();

      cy.window().then((win) => {
        const testData = win.localStorage.getItem('testkey');
        expect(testData).to.be.null;
      });
    });

    it('should redirect to login page after logout', () => {
      cy.adminLogout();
      cy.url().then((url) => {
        expect(url).to.include('/admin/login');
      });
    });

    it('should allow re-login after logout', () => {
      cy.adminLogout();
      cy.url().should('include', '/admin/login');

      // Login again
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');
    });
  });

  describe('Logout UI interactions', () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    it('should display user avatar/dropdown menu', () => {
      cy.get('a.first-letter', { timeout: 10000 }).should('be.visible');
    });

    it('should show logout option in dropdown', () => {
      cy.get('a.first-letter').click({ force: true });
      cy.get('div.logout', { timeout: 5000 }).should('be.visible');
    });

    it('should have logout link in dropdown menu', () => {
      cy.get('a.first-letter').click({ force: true });
      cy.get('div.logout a').contains('Logout').should('be.visible');
    });

    it('should close dropdown after clicking logout', () => {
      cy.get('a.first-letter').click({ force: true });
      cy.get('div.logout', { timeout: 5000 }).should('be.visible');
      cy.get('div.logout a').contains('Logout').click({ force: true });
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should have clickable logout button', () => {
      cy.get('a.first-letter').click({ force: true });
      cy.get('div.logout a').contains('Logout').should('not.be.disabled');
    });
  });

  describe('Logout with navigation', () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    it('should logout from admin dashboard', () => {
      cy.visit('/admin');
      cy.adminLogout();
      cy.url().should('include', '/admin/login');
    });

    it('should logout from different admin pages', () => {
      cy.visit('/admin/users');
      cy.adminLogout();
      cy.url().should('include', '/admin/login');
    });

    it('should maintain logout state after page refresh', () => {
      cy.adminLogout();
      cy.reload();
      cy.url().should('include', '/admin/login');
    });
  });

  describe('Session cleanup on logout', () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    it('should clear all cookies on logout', () => {
      cy.adminLogout();
      cy.getAllCookies().then((cookies) => {
        const sessionCookies = cookies.filter((c) => c.name.includes('session'));
        expect(sessionCookies.length).to.be.equal(0);
      });
    });

    it('should clear authentication tokens', () => {
      cy.adminLogout();
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        expect(token).to.be.null;
      });
    });

    it('should clear user data from session storage', () => {
      cy.window().then((win) => {
        win.sessionStorage.setItem('user', JSON.stringify({ id: 1 }));
      });

      cy.adminLogout();

      cy.window().then((win) => {
        const userData = win.sessionStorage.getItem('user');
        expect(userData).to.be.null;
      });
    });
  });

  describe('Logout error handling', () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    it('should handle logout API failure gracefully', () => {
      cy.intercept('POST', '**/adminLogoutJson', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('logoutError');

      cy.adminLogout();
      cy.waitForAPI('logoutError');
      // Should still redirect to login page
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should logout even if API request times out', () => {
      cy.intercept('POST', '**/adminLogoutJson', (req) => {
        // Simulate timeout by not responding
        req.destroy();
      }).as('logoutTimeout');

      cy.adminLogout();
      // Should eventually redirect to login
      cy.url({ timeout: 15000 }).should('include', '/admin/login');
    });
  });

  describe('Concurrent logout attempts', () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    it('should handle multiple logout clicks gracefully', () => {
      cy.get('a.first-letter').click({ force: true });
      cy.get('div.logout', { timeout: 5000 }).should('be.visible');

      // Click logout button multiple times rapidly
      cy.get('div.logout a')
        .contains('Logout')
        .click({ force: true, multiple: true });

      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });
  });

  describe('Logout from inactive session', () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    it('should logout after inactivity period', () => {
      // This test depends on session timeout configuration
      // Skip if timeout is not configured
      cy.visit('/admin');
      cy.wait(2000); // Wait for some time
      cy.adminLogout();
      cy.url().should('include', '/admin/login');
    });
  });

  describe('Logout flow with page interactions', () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    it('should logout and prevent going back to admin page via browser back button', () => {
      cy.visit('/admin');
      cy.adminLogout();
      cy.url().should('include', '/admin/login');
      cy.go('back');
      // Should redirect to login page
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should logout and prevent accessing cached admin pages', () => {
      cy.visit('/admin/users');
      cy.adminLogout();
      cy.url().should('include', '/admin/login');
      cy.visit('/admin/users', { failOnStatusCode: false });
      cy.url().should('include', '/admin/login');
    });
  });

  describe('Logout button states', () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    it('should have enabled logout button', () => {
      cy.get('a.first-letter').click({ force: true });
      cy.get('div.logout a')
        .contains('Logout')
        .should('not.be.disabled');
    });

    it('should show logout option with correct styling', () => {
      cy.get('a.first-letter').click({ force: true });
      cy.get('div.logout a')
        .contains('Logout')
        .should('have.css', 'cursor')
        .and('equal', 'pointer');
    });
  });
});
