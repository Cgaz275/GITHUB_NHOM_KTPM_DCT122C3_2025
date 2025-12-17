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
    video: true,
    videoOnFailOnly: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchFn) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchFn.args.push('--disable-blink-features=AutomationControlled');
        }
        return launchFn;
      });
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
