/// <reference types="cypress" />
Cypress.Commands.add('fazerLogin', (email, senha) => {
    cy.visit('http://localhost:5173'); // Se você configurou baseUrl no cypress.config, pode usar apenas cy.visit('/')

    cy.get('input[type="email"]').clear().type(email, { delay: 30 });
    cy.get('input[type="password"]').clear().type(senha, { delay: 30 });
    cy.contains('button', 'Entrar').click();

    // Aguarda o painel principal carregar
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('gerarCPF', () => {
    const random = () => Math.floor(Math.random() * 9);
    return Array.from({ length: 11 }, random).join('');
});

// Comando para gerar E-mail aleatório
Cypress.Commands.add('gerarEmail', () => {
    const sufixo = Date.now().toString().slice(-4);
    return `cliente_${sufixo}@teste.com`;
});