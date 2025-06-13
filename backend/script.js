document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO DOM ---
    // A única parte de autenticação que sobra é o container principal, que não usamos mais
    const appContainer = document.getElementById('app-container');

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

    // --- BANCO DE DADOS LOCAL (CLIENT-SIDE) ---
    // Voltamos a usar os arrays locais para gerenciar os dados
    let proximoId = 3;
    let caronasDisponiveis = [
        { id: 1, origem: 'araras', destino: 'sao paulo', data: '2025-07-20', vagas: 3, valor: 35.00, localEmbarque: 'Rodoviária de Araras' },
        { id: 2, origem: 'leme', destino: 'campinas', data: '2025-07-22', vagas: 1, valor: 20.00, localEmbarque: 'Praça Central' }
    ];
    let viagensAceitas = [];

    // --- FUNÇÕES DE CONTROLE DE VISUALIZAÇÃO ---
    const showView = (viewToShow) => {
        [homeView, offerView, searchView, myRidesView].forEach(view => view.classList.add('hidden'));
        viewToShow.classList.remove('hidden');
    };
    
    // Inicia na tela Home
    showView(homeView);

    // --- NAVEGAÇÃO PRINCIPAL DA APLICAÇÃO ---
    logoLink.addEventListener('click', (e) => { e.preventDefault(); showView(homeView); });
    offerLink.addEventListener('click', (e) => { e.preventDefault(); showView(offerView); });
    searchLink.addEventListener('click', (e) => {
        e.preventDefault();
        showView(searchView);
        buscarCaronas();
    });
    myRidesLink.addEventListener('click', (e) => {
        e.preventDefault();
        showView(myRidesView);
        renderizarMinhasViagens();
    });
    homeOfferBtn.addEventListener('click', () => showView(offerView));

    // --- LÓGICA PRINCIPAL DA APLICAÇÃO (100% LOCAL) ---

    // OFERECER CARONA
    offerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const novaCarona = {
            id: proximoId++,
            origem: document.getElementById('origem-oferta').value.trim().toLowerCase(),
            destino: document.getElementById('destino-oferta').value.trim().toLowerCase(),
            data: document.getElementById('data-oferta').value,
            vagas: parseInt(document.getElementById('vagas-oferta').value),
            valor: parseFloat(document.getElementById('valor-oferta').value),
            localEmbarque: document.getElementById('local-embarque-oferta').value.trim()
        };
        caronasDisponiveis.push(novaCarona);
        alert('Carona publicada com sucesso!');
        offerForm.reset();
        searchLink.click();
    });

    // BUSCAR CARONAS
    const buscarCaronas = () => {
        const origemBusca = document.getElementById('origem-busca').value.trim().toLowerCase();
        const destinoBusca = document.getElementById('destino-busca').value.trim().toLowerCase();
        const dataBusca = document.getElementById('data-busca').value;

        const resultados = caronasDisponiveis.filter(carona => {
            const matchOrigem = !origemBusca || carona.origem.includes(origemBusca);
            const matchDestino = !destinoBusca || carona.destino.includes(destinoBusca);
            const matchData = !dataBusca || carona.data === dataBusca;
            return matchOrigem && matchDestino && matchData;
        });
        exibirResultados(resultados);
    };
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        buscarCaronas();
    });

    // RENDERIZAR RESULTADOS E VIAGENS ACEITAS
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
        } else {
            caronas.forEach(carona => {
                const caronaElement = document.createElement('div');
                caronaElement.classList.add('ride-result');
                caronaElement.innerHTML = `
                    ${formatarCarona(carona)}
                    <button class="btn btn-accept" data-ride-id="${carona.id}">Aceitar Viagem</button>
                `;
                resultsList.appendChild(caronaElement);
            });
        }
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

    // ACEITAR VIAGEM
    resultsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-accept')) {
            const rideId = parseInt(e.target.getAttribute('data-ride-id'));
            const rideIndex = caronasDisponiveis.findIndex(carona => carona.id === rideId);
            
            if (rideIndex > -1) {
                const [acceptedRide] = caronasDisponiveis.splice(rideIndex, 1);
                viagensAceitas.push(acceptedRide);
                
                alert('Viagem aceita com sucesso! Consulte a seção "Suas Viagens".');
                buscarCaronas(); // Re-renderiza a lista de disponíveis, agora sem a carona aceita
            }
        }
    });
});