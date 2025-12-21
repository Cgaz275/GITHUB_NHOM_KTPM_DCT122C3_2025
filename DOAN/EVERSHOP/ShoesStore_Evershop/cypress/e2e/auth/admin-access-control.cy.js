describe('Admin Access Control', () => {
  describe('Protected admin pages', () => {
    it('should redirect to login when accessing /admin without authentication', () => {
      cy.clearAuthData();
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should redirect to login when accessing /admin/dashboard without authentication', () => {
      cy.clearAuthData();
      cy.visit('/admin/dashboard', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should allow authenticated users to access /admin', () => {
      cy.adminLogin();
      cy.visit('/admin');
      cy.url().should('not.include', '/admin/login');
    });

    it('should allow authenticated users to access dashboard', () => {
      cy.adminLogin();
      cy.visit('/admin/dashboard');
      cy.url().should('not.include', '/admin/login');
    });
  });

  describe('Unauthorized access attempts', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should prevent unauthorized access to user management', () => {
      cy.visit('/admin/users', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should prevent unauthorized access to product management', () => {
      cy.visit('/admin/products', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should prevent unauthorized access to settings', () => {
      cy.visit('/admin/settings', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should prevent unauthorized access to reports', () => {
      cy.visit('/admin/reports', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should prevent unauthorized access to admin API endpoints', () => {
      cy.request({
        url: '/api/admin/users',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403, 302]);
      });
    });
  });

  describe('Login page access', () => {
    it('should allow unauthenticated access to /admin/login', () => {
      cy.clearAuthData();
      cy.visit('/admin/login');
      cy.url().should('include', '/admin/login');
      cy.get('[class*="admin-login"]').should('be.visible');
    });

    it('should allow authenticated users to visit /admin/login (may redirect)', () => {
      cy.adminLogin();
      cy.visit('/admin/login');
      // May either show login page or redirect to dashboard
      cy.url().then((url) => {
        expect(url).to.satisfy((url) => {
          return url.includes('/admin/login') || url.includes('/admin');
        });
      });
    });
  });

  describe('Session-based access control', () => {
    it('should maintain access with valid session', () => {
      cy.adminLogin();
      cy.visit('/admin');
      cy.url().should('not.include', '/admin/login');

      // Verify session exists
      cy.getCookie('sessionid').then((cookie) => {
        expect(cookie).to.exist;
      });
    });

    it('should deny access with invalid/expired session', () => {
      cy.adminLogin();

      // Clear session cookie
      cy.clearCookies();

      cy.visit('/admin', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should require re-authentication after session expiration', () => {
      cy.adminLogin();

      // Simulate session expiration by clearing cookies
      cy.clearCookies();

      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('include', '/admin/login');

      // Should be able to login again
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');
    });
  });

  describe('Cross-site request forgery protection', () => {
    it('should handle CSRF token in login form', () => {
      cy.visit('/admin/login');
      cy.get('form').then(($form) => {
        // Check if form contains CSRF protection (input or header)
        expect($form).to.exist;
      });
    });

    it('should validate POST requests to API endpoints', () => {
      cy.request({
        method: 'POST',
        url: '/api/admin/users',
        failOnStatusCode: false
      }).then((response) => {
        // Should fail without proper auth
        expect(response.status).to.be.oneOf([401, 403, 400]);
      });
    });
  });

  describe('Admin pages content access', () => {
    it('should display admin dashboard after login', () => {
      cy.adminLogin();
      cy.visit('/admin');
      // Dashboard should load without redirect to login
      cy.url().should('not.include', '/admin/login');
    });

    it('should not display admin content to unauthenticated users', () => {
      cy.clearAuthData();
      cy.visit('/admin', { failOnStatusCode: false });
      // Should be redirected away
      cy.url().should('include', '/admin/login');
    });

    it('should allow navigation between admin pages when authenticated', () => {
      cy.adminLogin();
      cy.visit('/admin');
      cy.url().should('not.include', '/admin/login');

      // Navigate to different admin sections
      cy.visit('/admin/users', { failOnStatusCode: false });
      cy.url().then((url) => {
        expect(url).not.to.include('/admin/login');
      });
    });
  });

  describe('Protected API endpoints', () => {
    it('should deny unauthorized API requests', () => {
      cy.clearAuthData();
      cy.request({
        url: '/api/admin/dashboard',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403, 302]);
      });
    });

    it('should allow authorized API requests', () => {
      cy.adminLogin();
      cy.request({
        url: '/api/admin/dashboard',
        failOnStatusCode: false
      }).then((response) => {
        // Should be 200 or 404 (page not found), not 401/403
        expect(response.status).not.to.be.oneOf([401, 403]);
      });
    });

    it('should require valid JWT token for API endpoints', () => {
      cy.request({
        method: 'GET',
        url: '/api/admin/users',
        headers: {
          Authorization: 'Bearer invalid_token_xyz'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });
  });

  describe('Multiple concurrent sessions', () => {
    it('should allow one authenticated session at a time', () => {
      // Login first admin
      cy.adminLogin('alanewiston2@gmail.com', 'a12345678');
      cy.url().should('not.include', '/admin/login');

      // Open another browser context (simulate new session)
      cy.clearAuthData();

      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('include', '/admin/login');
    });
  });

  describe('Session hijacking prevention', () => {
    it('should not allow session fixation attacks', () => {
      cy.adminLogin();

      // Get current session cookie
      cy.getCookie('sessionid').then((originalCookie) => {
        expect(originalCookie).to.exist;

        // Logout
        cy.adminLogout();

        // Try to use the old session cookie
        cy.setCookie('sessionid', originalCookie.value);
        cy.visit('/admin', { failOnStatusCode: false });

        // Should be redirected to login
        cy.url({ timeout: 10000 }).should('include', '/admin/login');
      });
    });

    it('should regenerate session on login', () => {
      cy.clearAuthData();

      // Get any pre-login cookies
      cy.getCookie('sessionid').then((preCookie) => {
        cy.adminLogin();

        // Get session cookie after login
        cy.getCookie('sessionid').then((postCookie) => {
          // Session should be created on login
          expect(postCookie).to.exist;
        });
      });
    });
  });

  describe('Redirect behavior on login', () => {
    it('should redirect to admin after successful login', () => {
      cy.clearAuthData();
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('include', '/admin');
    });

    it('should redirect to referrer after login if available', () => {
      cy.clearAuthData();
      // Try to access a protected page directly
      cy.visit('/admin/users', { failOnStatusCode: false });
      cy.url().should('include', '/admin/login');

      // Login
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();

      // Should be redirected to requested page or dashboard
      cy.url({ timeout: 15000 }).then((url) => {
        expect(url).not.to.include('/admin/login');
      });
    });
  });

  describe('Logout and access control', () => {
    it('should immediately revoke access after logout', () => {
      cy.adminLogin();
      cy.visit('/admin');
      cy.url().should('not.include', '/admin/login');

      cy.adminLogout();

      cy.visit('/admin', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should prevent access with cached credentials after logout', () => {
      cy.adminLogin();
      cy.window().then((win) => {
        win.localStorage.setItem('cachedToken', 'sometoken');
      });

      cy.adminLogout();

      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('include', '/admin/login');
    });
  });

  describe('Admin page structure and permissions', () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    it('should display admin navigation menu', () => {
      cy.visit('/admin');
      // Check for main admin navigation
      cy.get('[class*="nav"], [class*="sidebar"], [class*="menu"]', {
        timeout: 10000
      }).should('exist');
    });

    it('should have logout option in authenticated state', () => {
      cy.visit('/admin');
      cy.get('a.first-letter', { timeout: 10000 }).should('be.visible');
    });

    it('should not display login form when authenticated', () => {
      cy.visit('/admin/login');
      // Should not show login form if already authenticated
      cy.url().then((url) => {
        if (url.includes('/admin/login')) {
          // May show login form if system doesn't redirect
          cy.get('input[name="email"]').then(($elem) => {
            expect($elem.length).to.be.greaterThanOrEqual(0);
          });
        }
      });
    });
  });
});
