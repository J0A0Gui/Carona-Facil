// --- CaronaFácil Back-end ---
// Este é um servidor simples usando Node.js e Express.
// Ele foi projetado para ser o futuro back-end da aplicação "CaronaFácil".

// --- 1. IMPORTAÇÃO DE DEPENDÊNCIAS ---

// Express é o framework que usamos para criar o servidor e as rotas da API.
const express = require('express');

// CORS (Cross-Origin Resource Sharing) é um pacote para permitir que o nosso front-end
// (que roda em um domínio/porta diferente) possa fazer requisições para este back-end.
const cors = require('cors');

// --- 2. INICIALIZAÇÃO DO APLICATIVO ---

// Criamos uma instância do Express, que será o nosso aplicativo principal.
const app = express();

// Definimos a porta em que o nosso servidor irá rodar.
const PORT = 3000;

// --- 3. CONFIGURAÇÃO DE MIDDLEWARES ---

// Habilitamos o CORS para que qualquer front-end possa acessar nossa API.
app.use(cors());

// Habilitamos o express.json(), um middleware que faz o "parse" do corpo (body)
// das requisições que chegam em formato JSON. Sem isso, não conseguiríamos
// ler os dados enviados pelo front-end no método POST.
app.use(express.json());

// --- 4. BANCO DE DADOS SIMULADO (EM MEMÓRIA) ---

// IMPORTANTE: Por enquanto, os dados são armazenados em um array na memória.
// Isso significa que eles serão perdidos toda vez que o servidor for reiniciado.
// No futuro, esta seção seria substituída pela conexão com um banco de dados real
// (como PostgreSQL, MongoDB, etc.).

let proximoId = 3; // Começa depois dos IDs dos dados iniciais
let caronasDisponiveis = [
    { id: 1, origem: 'araras', destino: 'sao paulo', data: '2025-07-20', vagas: 3, valor: 35.00, localEmbarque: 'Rodoviária de Araras' },
    { id: 2, origem: 'leme', destino: 'campinas', data: '2025-07-22', vagas: 1, valor: 20.00, localEmbarque: 'Praça Central' }
];

// --- 5. DEFINIÇÃO DAS ROTAS DA API ---

// Uma rota é um "caminho" da nossa API que executa uma ação específica.
// Usamos o padrão RESTful para nomear nossas rotas.

/**
 * ROTA: GET /api/caronas
 * OBJETIVO: Retornar a lista de todas as caronas disponíveis.
 * FUTURO: Aqui, em vez de retornar o array `caronasDisponiveis`, você faria
 * uma consulta no seu banco de dados. Ex: `db.query('SELECT * FROM caronas')`
 */
app.get('/api/caronas', (req, res) => {
    console.log('Recebida requisição GET para /api/caronas');
    res.json(caronasDisponiveis);
});

/**
 * ROTA: POST /api/caronas
 * OBJETIVO: Criar uma nova carona com base nos dados enviados no corpo da requisição.
 * FUTURO: Aqui, em vez de adicionar ao array, você faria uma inserção
 * no seu banco de dados. Ex: `db.query('INSERT INTO caronas (...) VALUES (...)', [dados])`
 */
app.post('/api/caronas', (req, res) => {
    // Os dados da nova carona vêm no corpo da requisição (req.body)
    const novaCarona = req.body;
    console.log('Recebida requisição POST para /api/caronas com os dados:', novaCarona);

    // Validação simples (em um projeto real, a validação seria mais robusta)
    if (!novaCarona.origem || !novaCarona.destino || !novaCarona.data) {
        return res.status(400).json({ message: 'Dados incompletos. Origem, destino e data são obrigatórios.' });
    }

    // Adiciona um ID único à nova carona
    novaCarona.id = proximoId++;

    // Adiciona a nova carona à nossa lista
    caronasDisponiveis.push(novaCarona);

    // Retorna a carona criada com o status 201 (Created)
    res.status(201).json(novaCarona);
});


// --- 6. INICIALIZAÇÃO DO SERVIDOR ---

// O comando app.listen "sobe" o servidor e o faz "escutar" por requisições na porta definida.
app.listen(PORT, () => {
    console.log(`Servidor "CaronaFácil" rodando na porta ${PORT}`);
    console.log('API disponível em http://localhost:3000/api/caronas');
});