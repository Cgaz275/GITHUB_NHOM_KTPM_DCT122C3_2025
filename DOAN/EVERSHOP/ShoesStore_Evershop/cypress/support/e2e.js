import './commands';

// Set test credentials
const adminEmail = Cypress.env('ADMIN_EMAIL') || 'alanewiston2@gmail.com';
const adminPassword = Cypress.env('ADMIN_PASSWORD') || 'a12345678';

Cypress.env('TEST_ADMIN_EMAIL', adminEmail);
Cypress.env('TEST_ADMIN_PASSWORD', adminPassword);

// Seed test admin before running tests
before(function seedData() {
  cy.task('seedTestAdmin', null, { timeout: 30000 }).then((result) => {
    if (result.success) {
      cy.log('✓ Test admin user seeded successfully');
    } else {
      cy.log(`⚠ Test admin seed: ${result.message}`);
    }
  });
});

// Cleanup after all tests
after(function cleanupData() {
  cy.task('closePool', null, { timeout: 10000 });
});

afterEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('ResizeObserver loop limit exceeded') ||
    err.message.includes('Network request failed')
  ) {
    return false;
  }
});
