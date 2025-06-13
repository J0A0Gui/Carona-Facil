/*
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
/*
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
    console.log('API disponível em https://carona-facil.onrender.com');
});*/

// --- CaronaFácil Back-end ---
// VERSÃO ATUALIZADA COM ROTAS DE CADASTRO E LOGIN

// --- 1. IMPORTAÇÃO DE DEPENDÊNCIAS ---
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Biblioteca para criptografar senhas
const jwt = require('jsonwebtoken'); // Biblioteca para criar Tokens (JWT)

// --- 2. INICIALIZAÇÃO DO APLICATIVO ---
const app = express();
const PORT = 3000;

// --- 3. CONFIGURAÇÃO DE MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- 4. BANCO DE DADOS SIMULADO (EM MEMÓRIA) ---
let proximoIdCarona = 3;
let caronasDisponiveis = [
    { id: 1, origem: 'araras', destino: 'sao paulo', data: '2025-07-20', vagas: 3, valor: 35.00, localEmbarque: 'Rodoviária de Araras' },
    { id: 2, origem: 'leme', destino: 'campinas', data: '2025-07-22', vagas: 1, valor: 20.00, localEmbarque: 'Praça Central' }
];

// NOVO: Array para armazenar usuários. Em um projeto real, isso seria uma tabela no banco de dados.
let usuarios = [];
let proximoIdUsuario = 1;

// --- 5. DEFINIÇÃO DAS ROTAS DA API ---

// ROTA PÚBLICA (NÃO PRECISA DE LOGIN)
app.get('/api/caronas', (req, res) => {
    res.json(caronasDisponiveis);
});

// ROTA PROTEGIDA (EXIGIRIA LOGIN NO FUTURO)
app.post('/api/caronas', (req, res) => {
    // Por enquanto, esta rota ainda é pública. No futuro, adicionaríamos um middleware de autenticação aqui.
    const novaCarona = req.body;
    novaCarona.id = proximoIdCarona++;
    caronasDisponiveis.push(novaCarona);
    res.status(201).json(novaCarona);
});


// --- NOVAS ROTAS DE AUTENTICAÇÃO ---

/**
 * ROTA: POST /api/register
 * OBJETIVO: Cadastrar um novo usuário.
 */
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verifica se o usuário já existe
        if (usuarios.find(user => user.email === email)) {
            return res.status(400).json({ message: 'Este e-mail já está em uso.' });
        }

        // Criptografa a senha antes de salvar (NUNCA SALVE SENHAS EM TEXTO PURO)
        const hashedPassword = await bcrypt.hash(password, 10); // 10 é o "custo" da criptografia

        // Cria o novo usuário
        const novoUsuario = {
            id: proximoIdUsuario++,
            email: email,
            password: hashedPassword // Salva a senha criptografada
        };

        usuarios.push(novoUsuario);
        console.log('Usuários cadastrados:', usuarios);
        
        // Retorna uma resposta de sucesso
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao tentar cadastrar usuário.' });
    }
});


/**
 * ROTA: POST /api/login
 * OBJETIVO: Autenticar um usuário e retornar um token JWT.
 */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Encontrar o usuário pelo e-mail
        const usuario = usuarios.find(user => user.email === email);
        if (!usuario) {
            return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
        }

        // 2. Comparar a senha enviada com a senha criptografada que está salva
        const senhaCorreta = await bcrypt.compare(password, usuario.password);
        if (!senhaCorreta) {
            return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
        }

        // 3. Se a senha estiver correta, gerar um Token (JWT)
        // O token contém informações do usuário (como o ID) e uma "chave secreta"
        // que só o servidor conhece, para garantir sua autenticidade.
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            'sua_chave_secreta_super_segura', // IMPORTANTE: Em um projeto real, isso deve ser uma variável de ambiente segura
            { expiresIn: '1h' } // O token expira em 1 hora
        );

        // 4. Enviar o token de volta para o front-end
        res.json({ message: 'Login bem-sucedido!', token: token });

    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao tentar fazer login.' });
    }
});


// --- 6. INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor "CaronaFácil" rodando na porta ${PORT}`);
});