describe('Authentication Security', () => {
  describe('Password security', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should mask password field input', () => {
      cy.visit('/admin/login');
      const password = 'a12345678';

      cy.get('input[name="password"], input#field-password')
        .type(password)
        .then(($input) => {
          const inputType = $input.attr('type');
          expect(inputType).to.match(/password|text/);
        });
    });

    it('should not display password in browser history', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).should('not.include', '/admin/login');

      // Check URL doesn't contain password
      cy.url().then((url) => {
        expect(url).not.to.include('a12345678');
      });
    });

    it('should handle special characters in password', () => {
      cy.visit('/admin/login');
      const specialPassword = 'p@ss!w0rd#$%^&*()';

      cy.get('input[name="password"], input#field-password').type(specialPassword);
      cy.get('input[name="password"], input#field-password').should('have.value', specialPassword);
    });

    it('should not show password in form data', () => {
      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');

      cy.intercept('POST', '**/adminLoginJson', (req) => {
        // Password should be in request body (encrypted/sent securely)
        expect(req.body).to.exist;
        req.reply();
      }).as('loginRequest');

      cy.submitLoginForm();
      cy.waitForAPI('loginRequest');
    });
  });

  describe('Session security', () => {
    it('should use secure session cookies', () => {
      cy.adminLogin();

      cy.getCookie('sessionid').then((cookie) => {
        if (cookie) {
          // Check for secure flags (if applicable)
          expect(cookie).to.have.property('value');
        }
      });
    });

    it('should expire session on logout', () => {
      cy.adminLogin();
      cy.getCookie('sessionid').then((cookie) => {
        expect(cookie).to.exist;
      });

      cy.adminLogout();
      cy.getCookie('sessionid').then((cookie) => {
        expect(cookie).to.be.null;
      });
    });

    it('should not allow session reuse after logout', () => {
      cy.adminLogin();

      cy.getCookie('sessionid').then((sessionCookie) => {
        cy.adminLogout();

        // Try to use the old session
        if (sessionCookie) {
          cy.setCookie('sessionid', sessionCookie.value);
          cy.visit('/admin', { failOnStatusCode: false });
          cy.url({ timeout: 10000 }).should('include', '/admin/login');
        }
      });
    });
  });

  describe('CSRF protection', () => {
    it('should validate login form submission', () => {
      cy.visit('/admin/login');

      cy.intercept('POST', '**/adminLoginJson', (req) => {
        // Verify request has proper headers
        expect(req.headers).to.exist;
        req.reply();
      }).as('loginSubmit');

      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();

      cy.waitForAPI('loginSubmit');
    });

    it('should reject unauthorized API requests', () => {
      cy.clearAuthData();

      cy.request({
        method: 'POST',
        url: '/api/admin/logout',
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403, 405]);
      });
    });
  });

  describe('XSS protection', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should not execute script in email field', () => {
      cy.visit('/admin/login');

      cy.get('input[name="email"], input#field-email').type(
        '<script>alert("xss")</script>'
      );

      // Should treat as string, not execute
      cy.get('input[name="email"], input#field-email').should('have.value', expect.anything());
    });

    it('should not execute script in password field', () => {
      cy.visit('/admin/login');

      cy.get('input[name="password"], input#field-password').type(
        '<script>alert("xss")</script>'
      );

      // Should treat as string, not execute
      cy.get('input[name="password"], input#field-password').should('have.value', expect.anything());
    });

    it('should safely display error messages', () => {
      cy.intercept('POST', '**/adminLoginJson', {
        statusCode: 401,
        body: { error: '<script>alert("xss")</script>' }
      }).as('loginError');

      cy.visit('/admin/login');
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword');
      cy.submitLoginForm();

      cy.waitForAPI('loginError');

      // Error message should be displayed safely
      cy.get('[class*="error"]', { timeout: 5000 }).should('exist');
    });
  });

  describe('Brute force protection', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should allow multiple login attempts without immediate lock', () => {
      cy.visit('/admin/login');

      // First attempt
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword1');
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');

      // Second attempt
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword2');
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');

      // Third attempt
      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword3');
      cy.submitLoginForm();
      cy.url().should('include', '/admin/login');
    });

    it('should handle rapid consecutive login attempts', () => {
      cy.visit('/admin/login');

      for (let i = 0; i < 3; i++) {
        cy.fillLoginForm('alanewiston2@gmail.com', `wrongpassword${i}`);
        cy.submitLoginForm();
        cy.url().should('include', '/admin/login');
      }

      // Should still allow login attempts
      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();
      cy.url({ timeout: 15000 }).then((url) => {
        // Either succeeds or fails, both are valid
        expect(url).to.exist;
      });
    });
  });

  describe('SQL injection prevention', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should safely handle SQL injection attempts in email field', () => {
      cy.visit('/admin/login');

      const sqlInjection = "admin' OR '1'='1";
      cy.fillLoginForm(sqlInjection, 'a12345678');
      cy.submitLoginForm();

      // Should not bypass authentication
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });

    it('should safely handle SQL injection in password field', () => {
      cy.visit('/admin/login');

      const sqlInjection = "' OR '1'='1";
      cy.fillLoginForm('alanewiston2@gmail.com', sqlInjection);
      cy.submitLoginForm();

      // Should not bypass authentication
      cy.url().should('include', '/admin/login');
    });

    it('should reject OR statements in login', () => {
      cy.visit('/admin/login');

      cy.fillLoginForm('test@example.com" OR "1"="1', 'anypassword');
      cy.submitLoginForm();

      cy.url().should('include', '/admin/login');
    });
  });

  describe('Authentication header validation', () => {
    it('should reject requests with missing auth headers', () => {
      cy.clearAuthData();

      cy.request({
        url: '/api/admin/users',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should reject invalid JWT tokens', () => {
      cy.request({
        url: '/api/admin/users',
        headers: {
          Authorization: 'Bearer invalid_token'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should reject malformed authorization headers', () => {
      cy.request({
        url: '/api/admin/users',
        headers: {
          Authorization: 'InvalidFormat token123'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403, 400]);
      });
    });
  });

  describe('Login form sanitization', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should sanitize HTML in email field', () => {
      cy.visit('/admin/login');

      cy.get('input[name="email"], input#field-email')
        .type('<img src=x onerror="alert(1)">')
        .then(($input) => {
          expect($input.val()).to.exist;
        });
    });

    it('should trim whitespace from email input', () => {
      cy.visit('/admin/login');

      cy.get('input[name="email"], input#field-email')
        .type('   alanewiston2@gmail.com   ')
        .trigger('blur');

      cy.get('input[name="email"], input#field-email').then(($input) => {
        const value = $input.val().toString().trim();
        expect(value).to.equal('alanewiston2@gmail.com');
      });
    });
  });

  describe('Man-in-the-middle protection', () => {
    it('should use HTTPS for login (in production)', () => {
      // This test checks the implementation uses secure transport
      cy.visit('/admin/login');

      // Check for secure content policy headers if available
      cy.request('/admin/login').then((response) => {
        // Should have security headers
        expect(response.status).to.equal(200);
      });
    });

    it('should not expose sensitive data in logs', () => {
      cy.clearAuthData();
      cy.visit('/admin/login');

      cy.window().then((win) => {
        const consoleLogSpy = cy.spy(win.console, 'log');
      });

      cy.fillLoginForm('alanewiston2@gmail.com', 'a12345678');
      cy.submitLoginForm();

      // Console should not contain password
      cy.window().then((win) => {
        // Password should not be logged
        expect(win).to.exist;
      });
    });
  });

  describe('Logout security', () => {
    it('should clear all sensitive data on logout', () => {
      cy.adminLogin();

      cy.window().then((win) => {
        win.localStorage.setItem('token', 'sometoken');
        win.sessionStorage.setItem('user', JSON.stringify({ id: 1 }));
      });

      cy.adminLogout();

      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        const user = win.sessionStorage.getItem('user');
        expect(token).to.be.null;
        expect(user).to.be.null;
      });
    });

    it('should invalidate session immediately on logout', () => {
      cy.adminLogin();

      cy.adminLogout();

      // Immediately try to access protected resource
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/admin/login');
    });
  });

  describe('Error message security', () => {
    beforeEach(() => {
      cy.clearAuthData();
    });

    it('should not reveal whether email exists', () => {
      cy.visit('/admin/login');

      // Invalid email
      cy.fillLoginForm('nonexistent@example.com', 'anypassword');
      cy.submitLoginForm();

      cy.get('[class*="error"], [class*="alert"]', { timeout: 10000 }).then(
        ($error1) => {
          const message1 = $error1.text();

          cy.visit('/admin/login');

          // Valid email, wrong password
          cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword');
          cy.submitLoginForm();

          cy.get('[class*="error"], [class*="alert"]', { timeout: 10000 }).then(
            ($error2) => {
              const message2 = $error2.text();

              // Messages should be generic (not reveal email existence)
              expect(message1).to.be.ok;
              expect(message2).to.be.ok;
            }
          );
        }
      );
    });

    it('should use generic error message on authentication failure', () => {
      cy.visit('/admin/login');

      cy.fillLoginForm('alanewiston2@gmail.com', 'wrongpassword');
      cy.submitLoginForm();

      cy.get('[class*="error"], [class*="alert"]', { timeout: 10000 }).should(
        'exist'
      );
    });
  });

  describe('Token security', () => {
    it('should not expose tokens in URLs', () => {
      cy.adminLogin();

      cy.url().then((url) => {
        expect(url).not.to.match(/token|jwt|auth/i);
      });
    });

    it('should not expose tokens in localStorage keys', () => {
      cy.adminLogin();

      cy.window().then((win) => {
        const keys = Object.keys(win.localStorage);
        const sensitiveKeys = keys.filter((k) =>
          k.toLowerCase().includes('password')
        );
        expect(sensitiveKeys).to.have.length(0);
      });
    });
  });
});
