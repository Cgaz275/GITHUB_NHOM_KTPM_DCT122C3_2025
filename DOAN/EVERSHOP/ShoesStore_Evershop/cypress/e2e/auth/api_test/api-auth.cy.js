/**
 * Auth API Tests
 * Tests for authentication endpoints including login, token refresh, and user verification
 */

describe('Auth API Tests', () => {
  const baseUrl = Cypress.config('baseUrl');
  const apiBaseUrl = `${baseUrl}/api`;
  const testAdmin = Cypress.env('TEST_ADMIN_EMAIL') || 'alanewiston2@gmail.com';
  const testPassword = Cypress.env('TEST_ADMIN_PASSWORD') || 'a12345678';
  const invalidEmail = 'invalid@test.com';
  const invalidPassword = 'wrongpassword';

  let accessToken = null;
  let refreshToken = null;

  describe('POST /api/user/tokens - Login/Token Generation', () => {
    it('Should successfully generate tokens with valid credentials', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('accessToken');
        expect(response.body.data).to.have.property('refreshToken');
        expect(response.body.data.accessToken).to.be.a('string');
        expect(response.body.data.refreshToken).to.be.a('string');

        // Store tokens for later tests
        accessToken = response.body.data.accessToken;
        refreshToken = response.body.data.refreshToken;
      });
    });

    it('Should return 500 error with invalid email', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: invalidEmail,
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
    });

    it('Should return 500 error with invalid password', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: invalidPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('error');
      });
    });

    it('Should return 400 error with missing email', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('Should return 400 error with missing password', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('Should return 400 error with empty body', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('Should return 400 error with invalid email format', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: 'notanemail',
          password: testPassword
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500]);
      });
    });

    it('Should return consistent access token format', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        const { accessToken } = response.body.data;
        // JWT tokens have three parts separated by dots
        expect(accessToken.split('.').length).to.equal(3);
      });
    });

    it('Should return consistent refresh token format', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        const { refreshToken } = response.body.data;
        // Refresh token should be a valid string
        expect(refreshToken).to.be.a('string');
        expect(refreshToken.length).to.be.greaterThan(0);
      });
    });

    it('Should handle SQL injection attempts safely', () => {
      const sqlInjectionPayloads = [
        "admin' OR '1'='1",
        "admin'; DROP TABLE users; --",
        "' OR 1=1 --",
        "admin'--"
      ];

      sqlInjectionPayloads.forEach((payload) => {
        cy.request({
          method: 'POST',
          url: `${apiBaseUrl}/user/tokens`,
          body: {
            email: payload,
            password: testPassword
          },
          failOnStatusCode: false
        }).then((response) => {
          // Should not execute injection, should return error
          expect(response.status).to.be.oneOf([400, 422, 500]);
        });
      });
    });

    it('Should handle XSS attempts safely', () => {
      const xssPayloads = [
        "<script>alert('xss')</script>",
        "<img src=x onerror='alert(1)'>",
        "javascript:alert('xss')"
      ];

      xssPayloads.forEach((payload) => {
        cy.request({
          method: 'POST',
          url: `${apiBaseUrl}/user/tokens`,
          body: {
            email: payload,
            password: testPassword
          },
          failOnStatusCode: false
        }).then((response) => {
          // Should not execute XSS, should return error
          expect(response.status).to.be.oneOf([400, 422, 500]);
        });
      });
    });

    it('Should return different tokens on consecutive requests', () => {
      let firstToken = null;
      let secondToken = null;

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
        secondToken = response.body.data.accessToken;
        // Tokens should be different (generated at different times)
        expect(firstToken).to.not.equal(secondToken);
      });
    });

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
  });

  describe('POST /api/user/token/refresh - Token Refresh', () => {
    let validRefreshToken = null;

    before(() => {
      // Get a valid refresh token
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        validRefreshToken = response.body.data.refreshToken;
      });
    });

    it('Should successfully refresh token with valid refresh token', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/token/refresh`,
        body: {
          refreshToken: validRefreshToken
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('accessToken');
        expect(response.body.data.accessToken).to.be.a('string');

        // New access token should be different from refresh token
        expect(response.body.data.accessToken).to.not.equal(validRefreshToken);
      });
    });

    it('Should return 400 error with missing refresh token', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/token/refresh`,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error.message).to.include('Refresh token is required');
      });
    });

    it('Should return 401 error with invalid refresh token', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/token/refresh`,
        body: {
          refreshToken: 'invalid_refresh_token_xyz'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('error');
      });
    });

    it('Should return 401 error with malformed refresh token', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/token/refresh`,
        body: {
          refreshToken: 'not.a.jwt.token'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });

    it('Should return 401 error with empty refresh token', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/token/refresh`,
        body: {
          refreshToken: ''
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401]);
      });
    });

    it('Should generate new access token on each refresh', () => {
      let firstNewToken = null;
      let secondNewToken = null;

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/token/refresh`,
        body: {
          refreshToken: validRefreshToken
        }
      }).then((response) => {
        firstNewToken = response.body.data.accessToken;
      });

      cy.wait(500);

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/token/refresh`,
        body: {
          refreshToken: validRefreshToken
        }
      }).then((response) => {
        secondNewToken = response.body.data.accessToken;
        // New tokens should be different
        expect(firstNewToken).to.not.equal(secondNewToken);
      });
    });

    it('Should return valid JWT format access token', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/token/refresh`,
        body: {
          refreshToken: validRefreshToken
        }
      }).then((response) => {
        const { accessToken } = response.body.data;
        // JWT format check: three parts separated by dots
        expect(accessToken.split('.').length).to.equal(3);
      });
    });

    it('Should handle null refresh token', () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/token/refresh`,
        body: {
          refreshToken: null
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401]);
      });
    });
  });

  describe('Auth Flow Integration Tests', () => {
    it('Should complete full authentication flow: login -> refresh -> verify token', () => {
      let generatedAccessToken = null;
      let generatedRefreshToken = null;
      let refreshedAccessToken = null;

      // Step 1: Login and get tokens
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        generatedAccessToken = response.body.data.accessToken;
        generatedRefreshToken = response.body.data.refreshToken;
      });

      // Step 2: Refresh the access token
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/token/refresh`,
        body: {
          refreshToken: generatedRefreshToken
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        refreshedAccessToken = response.body.data.accessToken;
        // Refreshed token should be different from original
        expect(refreshedAccessToken).to.not.equal(generatedAccessToken);
      });

      // Step 3: Verify refreshed token is valid JWT format
      cy.wrap(null).then(() => {
        const parts = refreshedAccessToken.split('.');
        expect(parts.length).to.equal(3);
        expect(parts[0].length).to.be.greaterThan(0);
        expect(parts[1].length).to.be.greaterThan(0);
        expect(parts[2].length).to.be.greaterThan(0);
      });
    });

    it('Should handle token expiration and refresh flow', () => {
      // Get initial tokens
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        const refreshToken = response.body.data.refreshToken;
        const accessToken = response.body.data.accessToken;

        // Refresh token should still work even if access token would expire
        cy.request({
          method: 'POST',
          url: `${apiBaseUrl}/user/token/refresh`,
          body: {
            refreshToken: refreshToken
          }
        }).then((refreshResponse) => {
          expect(refreshResponse.status).to.equal(200);
          expect(refreshResponse.body.data.accessToken).to.not.equal(accessToken);
        });
      });
    });
  });

  describe('Auth API Performance Tests', () => {
    it('Should generate token within acceptable time', () => {
      const startTime = Date.now();

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        // Should complete within 5 seconds
        expect(duration).to.be.lessThan(5000);
      });
    });

    it('Should refresh token within acceptable time', () => {
      let refreshToken = null;

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/tokens`,
        body: {
          email: testAdmin,
          password: testPassword
        }
      }).then((response) => {
        refreshToken = response.body.data.refreshToken;
      });

      const startTime = Date.now();

      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/user/token/refresh`,
        body: {
          refreshToken: refreshToken
        }
      }).then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        // Should complete within 3 seconds
        expect(duration).to.be.lessThan(3000);
      });
    });
  });
});
