import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'qjkijo',
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: process.env.CYPRESS_DEFAULT_COMMAND_TIMEOUT || 10000,
    requestTimeout: process.env.CYPRESS_REQUEST_TIMEOUT || 10000,
    responseTimeout: process.env.CYPRESS_RESPONSE_TIMEOUT || 10000,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: false,
    chromeWebSecurity: false,
    reporter: 'json',
    reporterOptions: {
      reportDir: 'cypress/results',
      overwrite: true
    },
    async setupNodeEvents(on, config) {
      const { seedTestAdmin, cleanupTestAdmin, closePool } = await import('./cypress/plugins/seedTestAdmin.js');

      on('task', {
        seedTestAdmin,
        cleanupTestAdmin,
        closePool
      });

      on('before:browser:launch', (browser = {}, launchFn) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchFn.args.push('--disable-blink-features=AutomationControlled');
        }
        return launchFn;
      });

      return config;
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  }
});
