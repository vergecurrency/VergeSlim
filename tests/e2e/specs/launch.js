// https://docs.cypress.io/api/introduction/api.html
describe('Launch application', () => {
  it('Visits the app root url', () => {
    cy.electronVisitUrl('./main_browser_window.js', 'http://localhost:8080')
    cy.visit('/')
    cy.contains('title', 'Verge Slim')
  })
})
