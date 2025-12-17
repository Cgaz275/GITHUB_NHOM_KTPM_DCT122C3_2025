import './commands';

// Set up environment variables for test credentials
beforeEach(() => {
  // Set default base URL for admin tests
  cy.visit('/admin/login');
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

// Make test credentials available globally
const adminEmail = Cypress.env('ADMIN_EMAIL') || 'alanewiston2@gmail.com';
const adminPassword = Cypress.env('ADMIN_PASSWORD') || 'a12345678';

Cypress.env('TEST_ADMIN_EMAIL', adminEmail);
Cypress.env('TEST_ADMIN_PASSWORD', adminPassword);
