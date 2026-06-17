describe('Suíte de Testes N2 - Controle de Vendas (Banco Limpo)', () => {

    const baseUrl = 'http://localhost:5173';
    const testEmail = `admin@vendas`;
    const testPassword = '123456';

    // ==========================================
    // MÓDULO 1: SETUP E AUTENTICAÇÃO
    // ==========================================
    context('Módulo 1 - Autenticação', () => {

        it('CT01 - [Fluxo Feliz] Criar uma nova conta no sistema limpo', () => {
            cy.visit(baseUrl);
            cy.contains('Primeiro cadastro').click();
            cy.gerarEmail().then((email) => {
                cy.get('input').eq(0).type('Admin Teste'); // Nome
                cy.contains('label', 'Email').next('input').type(email);    // E-mail
                // Preenche o primeiro campo de senha
                cy.get('input[type="password"]').first().type(testPassword);
                // Preenche o segundo campo (confirmação)
                cy.get('input[type="password"]').last().type(testPassword); // Confirmar Senha

                // Clica no botão de registrar ajustado
                cy.contains('button', 'Cadastrar').click();
                cy.url().should('not.include', 'Cadastrar');



            });


        });

        it('CT02 - [Fluxo de Erro] Exibir erro ao tentar login com senha incorreta', () => {
            cy.visit(baseUrl);

            cy.get('input[type="email"]').type(testEmail);
            cy.get('input[type="password"]').type('senha_errada_proposital');
            cy.contains('button', 'Entrar').click();

            cy.contains('button', 'Entrar').should('be.visible');
            cy.url().should('not.include', '/dashboard');
        });

        it('CT03 - [Fluxo Feliz] Fazer login com os dados recém-criados', () => {
            cy.fazerLogin(testEmail, testPassword);

            cy.contains('Dashboard').should('be.visible');
        });
    });

    // ==========================================
    // MÓDULO 2: CLIENTES
    // ==========================================
    context('Módulo 2 - Clientes', () => {

        it('CT04 - [Fluxo Feliz] Cadastrar um novo cliente corretamente', () => {

            cy.fazerLogin(testEmail, testPassword);
            cy.contains('Clientes').click();

            cy.contains('Novo Cliente').click();

            cy.gerarCPF().then((cpf) => {
                cy.gerarEmail().then((email) => {

                    cy.contains('label', 'Nome').next('input').type('Cliente Automação ' + Date.now().toString().slice(-4));
                    cy.contains('label', 'CPF/CNPJ').next('input').type(cpf);
                    cy.contains('label', 'Responsável').next('input').type('João da Silva');
                    cy.contains('label', 'Email').next('input').type(email);

                    cy.contains('button', 'Salvar').click();
                });
            });



            // Valida se o cliente apareceu na tabela
            cy.contains('Cliente Automação').should('be.visible');

        });

        it('CT05 - [Fluxo Feliz] Buscar/Filtrar um cliente cadastrado na listagem', () => {
            cy.fazerLogin(testEmail, testPassword);
            cy.contains('Clientes').click();

            cy.get('input[placeholder*="Buscar"], input[type="text"]').first().type('Cliente Automação');
            cy.contains('Cliente Automação').should('be.visible');
        });
    });

    // ==========================================
    // MÓDULO 3: PRODUTOS
    // ==========================================
    context('Módulo 3 - Produtos', () => {

        it('CT06 - [Fluxo Feliz] Editar a quantidade em estoque de um produto existente', () => {
            cy.fazerLogin(testEmail, testPassword);

            // Navega para a tela de produtos
            cy.contains('Produtos').click();
            cy.wait(1000);

            // Clica no botão de Editar do primeiro produto da lista
            cy.contains('Editar').first().click();

            // Definimos uma quantidade específica e "quebrada" para ter certeza que foi a nossa alteração
            const novaQuantidade = '88';

            // Altera a quantidade
            cy.get('input[type="number"]').last().clear().type(novaQuantidade);

            // Clica para salvar
            cy.contains('button', 'Salvar').click();

            // ==========================================
            // NOVA VALIDAÇÃO (Sem depender de mensagem)
            // ==========================================

            // 1. Garante que o botão Salvar sumiu (ou seja, o modal/formulário fechou)
            cy.contains('button', 'Salvar').should('not.exist');

            // 2. Garante que o novo número (88) agora está visível na tabela da tela de Produtos
            cy.contains(novaQuantidade, { timeout: 5000 }).should('be.visible');
        });

        it('CT07 - [Fluxo Feliz] Cadastrar um produto com todos os dados', () => {
            cy.fazerLogin(testEmail, testPassword);

            // Aguarda o painel principal carregar
            cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');

            // Navega para a tela de produtos
            cy.contains('Produtos').click();
            cy.wait(1000);
            cy.contains('Novo Produto').click();

            cy.get('input[type="text"]').first().type('Mouse Gamer');
            cy.get('input[type="text"]').eq(1).type('Mouse RGB 10000 DPI');
            cy.get('input[type="number"]').first().type('150'); // Preço
            cy.get('input[type="number"]').eq(1).type('25'); // Quantidade
            cy.get('input[type="number"]').eq(2).type('3750');

            cy.contains('button', 'Salvar').click();
            cy.contains('Mouse Gamer').should('be.visible');
        });

        it('CT08 - [Fluxo Feliz] Visualizar a listagem de produtos', () => {
            cy.fazerLogin(testEmail, testPassword);


            // Navega para a tela de produtos
            cy.contains('Produtos').click();
            cy.wait(1000);

            cy.contains('Mouse Gamer').should('be.visible');
        });
    });
    // ==========================================
    // MÓDULO 4: PEDIDOS
    // ==========================================
    context('Módulo 4 - Agendamento', () => {

        it('CT09 - [Fluxo de Erro] Criar agendamento', () => {

            cy.fazerLogin(testEmail, testPassword);

            cy.contains('Agenda').click();
            cy.wait(1000);

            cy.contains('+ Novo Agendamento').click();

            cy.contains('label', 'Data/Hora')
                .next('input')
                .type('2026-06-17T15:30'); // Define para 17 de Junho de 2026 às 15:30

            // CLIENTE (Usando select padrão)
            cy.contains('label', 'Cliente')
                .next('select')
                .select('João Silva'); // Coloque o nome de um cliente real existente no banco

            // VENDEDOR (Usando select padrão)
            cy.contains('label', 'Vendedor')
                .next('select')
                .select('dandan');
            cy.contains('button', 'Salvar').click();
        });

        it('CT10 - [Fluxo Feliz] Editar Agendamento', () => {

            cy.fazerLogin(testEmail, testPassword);

            cy.contains('Agenda').click();
            cy.wait(1000); // Aguarda os dados do banco carregarem na tabela

            // Comando para varrer todas as linhas (tr) dentro do corpo da tabela (tbody)
            cy.get('table tbody tr').each(($linha) => {

                // Pega o texto da 4ª coluna (índice 3) que é a Observação
                const observacao = $linha.find('td').eq(3).text().trim();

                // Pega o texto da 5ª coluna (índice 4) que é o Repetir
                const repetir = $linha.find('td').eq(4).text().trim();

                // Verifica a regra: Se a observação estiver vazia OU o repetir for um traço "—"
                if (observacao === '' || repetir === '—') {

                    // Clica no botão "Editar" DENTRO dessa linha específica que atendeu à regra
                    cy.wrap($linha).contains('Editar').click();

                    // Retorna false para quebrar o loop (faz o Cypress parar de procurar as outras linhas)
                    return false;
                }
            });

            // --- A PARTIR DAQUI SEGUE O SEU FLUXO NORMAL DE EDIÇÃO ---

            const timestamp = Date.now();

            // Como a observação podia estar vazia, o .clear() garante que limpa se tiver algo, e o .type() escreve
            cy.get('textarea')
                .clear()
                .type(`Agendamento de teste automatizado gerado em: ${timestamp}`);

            // Marca o checkbox de repetir caso estivesse desmarcado
            cy.get('input[type="checkbox"]').check();

            cy.contains('button', 'Salvar').click();


            cy.contains('button', 'Salvar').should('not.exist');
        });
    });

});