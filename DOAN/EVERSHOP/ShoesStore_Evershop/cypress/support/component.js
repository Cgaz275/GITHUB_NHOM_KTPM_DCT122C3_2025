import './commands';

Cypress.Commands.add('mount', (component, options = {}) => {
  const { ...mountOptions } = options;

  return cy.mount(component, {
    ...mountOptions
  });
});
