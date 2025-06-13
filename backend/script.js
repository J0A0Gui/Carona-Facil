document.addEventListener('DOMContentLoaded', () => {

    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');

    const homeView = document.getElementById('home-view');
    const offerView = document.getElementById('offer-view');
    const searchView = document.getElementById('search-view');
    const myRidesView = document.getElementById('my-rides-view');

    const logoLink = document.getElementById('logo-link');
    const offerLink = document.getElementById('offer-link');
    const searchLink = document.getElementById('search-link');
    const myRidesLink = document.getElementById('my-rides-link');
    const homeOfferBtn = document.getElementById('home-offer-btn');
    
    const offerForm = document.getElementById('offer-form');
    const searchForm = document.getElementById('search-form');
    
    const resultsList = document.getElementById('results-list');
    const myRidesList = document.getElementById('my-rides-list');

    //BANCO DE DADOS SIMULADO
    let proximoId = 0;
    let caronasDisponiveis = [
        
    ];
    let viagensAceitas = [];

    //CONTROLE DE VISUALIZAÇÃO
    const showView = (viewToShow) => {
        [homeView, offerView, searchView, myRidesView].forEach(view => view.classList.add('hidden'));
        viewToShow.classList.remove('hidden');
    };

    //LOGIN
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        showView(homeView);
    });

    //NAVEGAÇÃO
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
    
    //OFERECER CARONA
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

        if (novaCarona.origem && novaCarona.destino && novaCarona.data && novaCarona.vagas > 0 && !isNaN(novaCarona.valor) && novaCarona.localEmbarque) {
            caronasDisponiveis.push(novaCarona);
            alert('Carona publicada com sucesso!');
            offerForm.reset();
            searchLink.click();
        } else {
            alert('Por favor, preencha todos os campos corretamente.');
        }
    });

    //BUSCA E EXIBIÇÃO
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        buscarCaronas();
    });

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

    const exibirResultados = (resultados) => {
        resultsList.innerHTML = '';
        if (resultados.length === 0) {
            resultsList.innerHTML = '<p class="empty-message">Nenhuma carona encontrada com estes filtros.</p>';
            return;
        }
        resultados.forEach(carona => {
            const caronaElement = document.createElement('div');
            caronaElement.classList.add('ride-result');
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
            return;
        }
        
        viagensAceitas.forEach(carona => {
            const caronaElement = document.createElement('div');
            caronaElement.classList.add('ride-result', 'accepted-ride');
            caronaElement.innerHTML = formatarCarona(carona);
            myRidesList.appendChild(caronaElement);
        });
    };

    //ACEITAR VIAGEM
    resultsList.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-accept')) {
            const rideId = parseInt(e.target.getAttribute('data-ride-id'));
            const rideIndex = caronasDisponiveis.findIndex(carona => carona.id === rideId);
            
            if (rideIndex > -1) {
                const [acceptedRide] = caronasDisponiveis.splice(rideIndex, 1);
                viagensAceitas.push(acceptedRide);
                
                alert('Viagem aceita com sucesso! Consulte a seção "Suas Viagens" para ver os detalhes.');

                buscarCaronas();
            }
        }
    });
});