document.addEventListener('DOMContentLoaded', () => {

    // --- ENDEREÇO DO BACK-END ---
    // Mude para a URL do Render quando fizer o deploy do back-end
    const API_URL = 'https://carona-facil.onrender.com';

    // --- ELEMENTOS DO DOM ---
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    // Views de Autenticação
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Links de troca
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Views Principais
    const homeView = document.getElementById('home-view');
    const offerView = document.getElementById('offer-view');
    const searchView = document.getElementById('search-view');
    const myRidesView = document.getElementById('my-rides-view');

    // Links de Navegação Principal
    const logoLink = document.getElementById('logo-link');
    const offerLink = document.getElementById('offer-link');
    const searchLink = document.getElementById('search-link');
    const myRidesLink = document.getElementById('my-rides-link');
    const homeOfferBtn = document.getElementById('home-offer-btn');
    
    // Forms e Listas
    const offerForm = document.getElementById('offer-form');
    const searchForm = document.getElementById('search-form');
    const resultsList = document.getElementById('results-list');
    const myRidesList = document.getElementById('my-rides-list');
    
    // --- BANCO DE DADOS SIMULADO (CLIENT-SIDE) ---
    // Apenas para a lista de viagens aceitas pelo usuário atual
    let viagensAceitas = [];

    // --- LÓGICA DE NAVEGAÇÃO E CONTROLE DE VIEW ---
    const showMainView = (viewToShow) => {
        [homeView, offerView, searchView, myRidesView].forEach(view => view.classList.add('hidden'));
        viewToShow.classList.remove('hidden');
    };

    // Alternar entre Login e Cadastro
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });

    // Navegação Principal da Aplicação
    logoLink.addEventListener('click', (e) => { e.preventDefault(); showMainView(homeView); });
    offerLink.addEventListener('click', (e) => { e.preventDefault(); showMainView(offerView); });
    searchLink.addEventListener('click', (e) => {
        e.preventDefault();
        showMainView(searchView);
        buscarCaronas(); 
    });
    myRidesLink.addEventListener('click', (e) => {
        e.preventDefault();
        showMainView(myRidesView);
        renderizarMinhasViagens();
    });
    homeOfferBtn.addEventListener('click', () => showMainView(offerView));

    // --- LÓGICA DE AUTENTICAÇÃO ---

    // CADASTRO
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            alert('Cadastro realizado com sucesso! Por favor, faça o login.');
            showLoginLink.click(); // Simula clique para voltar para tela de login

        } catch (error) {
            alert(`Erro no cadastro: ${error.message}`);
        }
    });

    // LOGIN
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            // SALVAR O TOKEN: Esta é a chave da autenticação
            localStorage.setItem('token', data.token);

            // Transição para a aplicação principal
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            showMainView(homeView);

        } catch (error) {
            alert(`Erro no login: ${error.message}`);
        }
    });
    
    // --- LÓGICA PRINCIPAL DA APLICAÇÃO ---

    // BUSCAR CARONAS DO BACK-END
    const buscarCaronas = async () => {
        try {
            const response = await fetch(`${API_URL}/api/caronas`);
            if (!response.ok) throw new Error('Não foi possível buscar as caronas.');
            const caronas = await response.json();
            exibirResultados(caronas);
        } catch (error) {
            alert(error.message);
        }
    };
    
    // OFERECER CARONA (ENVIANDO TOKEN)
    offerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const novaCarona = {
            origem: document.getElementById('origem-oferta').value.trim().toLowerCase(),
            destino: document.getElementById('destino-oferta').value.trim().toLowerCase(),
            data: document.getElementById('data-oferta').value,
            vagas: parseInt(document.getElementById('vagas-oferta').value),
            valor: parseFloat(document.getElementById('valor-oferta').value),
            localEmbarque: document.getElementById('local-embarque-oferta').value.trim()
        };
        
        const token = localStorage.getItem('token');
        // No futuro, o back-end irá validar este token. Por enquanto, só enviamos.

        try {
            const response = await fetch(`${API_URL}/api/caronas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Descomente quando o back-end exigir autenticação para esta rota
                },
                body: JSON.stringify(novaCarona)
            });

            if (!response.ok) throw new Error('Erro ao publicar carona.');

            alert('Carona publicada com sucesso!');
            offerForm.reset();
            searchLink.click();

        } catch (error) {
            alert(error.message);
        }
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // A busca com filtros no front-end por enquanto, mas o ideal seria o back-end fazer isso
        buscarCaronas(); 
    });

    // LÓGICA PARA RENDERIZAR RESULTADOS (praticamente inalterada)
    const formatarCarona = (carona) => {
        const dataObj = new Date(carona.data + 'T00:00:00');
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const valorFormatado = `R$ ${carona.valor.toFixed(2).replace('.', ',')}`;
        return `
            <p><span>Origem:</span> ${carona.origem}</p>
            <p><span>Destino:</span> ${carona.destino}</p>
            <p><span>Data:</span> ${dataFormatada}</p>
            <p><span>Vagas Disponíveis:</span> ${carona.vagas}</p>
            <p><span>Valor:</span> ${valorFormatado}</p>
            <p><span>Local de Embarque:</span> ${carona.localEmbarque}</p>
        `;
    };

    const exibirResultados = (caronas) => {
        resultsList.innerHTML = '';
        if (caronas.length === 0) {
            resultsList.innerHTML = '<p class="empty-message">Nenhuma carona encontrada.</p>';
            return;
        }
        caronas.forEach(carona => {
            const caronaElement = document.createElement('div');
            caronaElement.classList.add('ride-result');
            // Nota: a lógica de aceitar viagem ainda é local, para simplificar.
            caronaElement.innerHTML = `
                ${formatarCarona(carona)}
                <button class="btn btn-accept" data-ride-id="${carona.id}">Aceitar Viagem</button>
            `;
            resultsList.appendChild(caronaElement);
        });
    };
    
    const renderizarMinhasViagens = () => {
        myRidesList.innerHTML = '';
        if (viagensAceitas.length === 0) {
            myRidesList.innerHTML = '<p class="empty-message">Você ainda não aceitou nenhuma viagem.</p>';
        } else {
            viagensAceitas.forEach(carona => {
                const caronaElement = document.createElement('div');
                caronaElement.classList.add('ride-result', 'accepted-ride');
                caronaElement.innerHTML = formatarCarona(carona);
                myRidesList.appendChild(caronaElement);
            });
        }
    };
    
    // LÓGICA DE ACEITAR VIAGEM (Ainda local para simplificar)
    resultsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-accept')) {
            // Esta parte precisaria ser refatorada para interagir com o back-end no futuro,
            // mas por enquanto, mantém a funcionalidade do protótipo.
            alert('Funcionalidade de aceitar viagem ainda em desenvolvimento no back-end!');
        }
    });

});