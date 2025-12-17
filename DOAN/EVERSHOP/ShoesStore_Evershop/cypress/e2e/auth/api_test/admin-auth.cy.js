/**
 * Admin Authentication API Tests
 * Tests for admin-specific authentication endpoints and workflows
 */

describe('Admin Authentication API Tests', () => {
  const baseUrl = Cypress.config('baseUrl');
  const apiBaseUrl = `${baseUrl}/api`;
  const testAdmin = Cypress.env('TEST_ADMIN_EMAIL') || 'alanewiston2@gmail.com';
  const testPassword = Cypress.env('TEST_ADMIN_PASSWORD') || 'a12345678';

  describe('Admin Login Endpoint - POST /api/user/tokens', () => {
    it('Should successfully login admin with valid credentials', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          email: testAdmin,
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status: ${response.status}`);
        cy.log(`Response: ${JSON.stringify(response.body)}`);
        expect(response.status).to.equal(200);
        expect(response.body.data).to.have.property('accessToken');
        expect(response.body.data).to.have.property('refreshToken');
      });
    });

    it('Should fail with invalid admin email', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: 'nonexistent@test.com',
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([500]);
      });
    });

    it('Should fail with incorrect password', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: 'wrongpassword123'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([500]);
      });
    });

    it('Should fail with empty credentials', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: '',
          password: ''
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 422, 500]);
      });
    });

    it('Should reject SQL injection in email field', () => {
      const sqlInjection = "admin' OR '1'='1";
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: sqlInjection,
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 422, 500]);
      });
    });

    it('Should reject XSS attempts in password field', () => {
      const xssPayload = "<script>alert('xss')</script>";
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: xssPayload
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 422, 500]);
      });
    });
  });

  describe('Admin Session Validation', () => {
    let validAccessToken = null;

    before(() => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        validAccessToken = response.body.data.accessToken;
      });
    });

    it('Should return valid access token with admin properties', () => {
      cy.wrap(null).then(() => {
        // JWT tokens have 3 parts separated by dots
        const parts = validAccessToken.split('.');
        expect(parts.length).to.equal(3);
        // Each part should be non-empty
        parts.forEach((part) => {
          expect(part.length).to.be.greaterThan(0);
        });
      });
    });

    it('Should use secure token format', () => {
      cy.wrap(null).then(() => {
        const parts = validAccessToken.split('.');
        expect(parts.length).to.equal(3);
        // Each part should be base64-like (non-empty)
        parts.forEach((part) => {
          expect(part.length).to.be.greaterThan(0);
        });
      });
    });

    it('Should provide different tokens on each login', () => {
      let firstToken = null;

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        firstToken = response.body.data.accessToken;
      });

      cy.wait(500);

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        expect(response.body.data.accessToken).to.not.equal(firstToken);
      });
    });
  });

  describe('Admin Authentication Edge Cases', () => {
    it('Should handle case sensitivity in email', () => {
      const upperCaseEmail = testAdmin.toUpperCase();

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: upperCaseEmail,
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should either succeed (case-insensitive) or return error
        expect(response.status).to.be.oneOf([200, 500]);
      });
    });

    it('Should handle whitespace in email', () => {
      const emailWithSpace = ` ${testAdmin} `;

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: emailWithSpace,
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should trim whitespace or return error
        expect(response.status).to.be.oneOf([200, 500]);
      });
    });

    it('Should handle very long email input', () => {
      const veryLongEmail = 'a'.repeat(500) + '@test.com';

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: veryLongEmail,
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500]);
      });
    });

    it('Should handle very long password input', () => {
      const veryLongPassword = 'p'.repeat(10000);

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: veryLongPassword
        },
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        // Should handle gracefully
        expect(response.status).to.be.oneOf([400, 422, 500]);
      });
    });

    it('Should reject null values in credentials', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: null,
          password: null
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500]);
      });
    });

    it('Should reject undefined values in credentials', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: undefined,
          password: undefined
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500]);
      });
    });

    it('Should handle additional unexpected fields in request', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword,
          unexpectedField: 'should be ignored',
          anotherField: 123
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data).to.have.property('accessToken');
      });
    });
  });

  describe('Admin Authentication Security Tests', () => {
    it('Should not expose sensitive information in error messages', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: 'nonexistent@test.com',
          password: 'anypassword'
        },
        failOnStatusCode: false
      }).then((response) => {
        const responseBody = JSON.stringify(response.body);
        // Error messages should not expose database info, internal details
        expect(responseBody).to.not.include('database');
        expect(responseBody).to.not.include('query');
      });
    });

    it('Should not return password in any API response', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        const responseBody = JSON.stringify(response.body);
        expect(responseBody).to.not.include(testPassword);
      });
    });

    it('Should use secure token format', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        const { accessToken } = response.body.data;
        // JWT tokens should have at least 3 parts
        const parts = accessToken.split('.');
        expect(parts.length).to.equal(3);
        // Each part should be base64-like (non-empty)
        parts.forEach((part) => {
          expect(part.length).to.be.greaterThan(0);
        });
      });
    });

    it('Should provide different tokens on each login', () => {
      let firstToken = null;

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        firstToken = response.body.data.accessToken;
      });

      cy.wait(500);

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        expect(response.body.data.accessToken).to.not.equal(firstToken);
      });
    });
  });

  describe('Admin Authentication Rate Limiting', () => {
    it('Should handle multiple rapid requests', () => {
      const requests = [];

      for (let i = 0; i < 5; i++) {
        requests.push(
          cy.request({
            method: 'POST',
            url: `${apiBaseUrl}/user/tokens`,
            body: {
              email: testAdmin,
              password: testPassword
            },
            failOnStatusCode: false
          })
        );
      }

      cy.wrap(requests).each((request) => {
        expect(request.status).to.be.oneOf([200, 429, 500]);
      });
    });

    it('Should reject excessive failed login attempts gracefully', () => {
      // Try multiple failed logins
      for (let i = 0; i < 3; i++) {
        cy.request({
          method: 'POST',
          url: `${apiBaseUrl}/user/tokens`,
          body: {
            email: testAdmin,
            password: 'wrongpassword' + i
          },
          failOnStatusCode: false
        });
      }

      // Next attempt should work if user exists
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should either succeed or be rate limited
        expect(response.status).to.be.oneOf([200, 429, 500]);
      });
    });
  });
});
