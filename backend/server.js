// --- CaronaFácil Back-end ---
// VERSÃO FINAL REVISADA E CORRIGIDA

// --- 1. IMPORTAÇÃO DE DEPENDÊNCIAS ---
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt =require('jsonwebtoken');

// --- 2. INICIALIZAÇÃO DO APLICATIVO EXPRESS ---
const app = express();
const PORT = process.env.PORT || 3000; // Render usa a variável de ambiente PORT

// --- 3. CONFIGURAÇÃO DE MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- 4. BANCO DE DADOS SIMULADO (EM MEMÓRIA) ---
let proximoIdCarona = 3;
let caronasDisponiveis = [
    { id: 1, origem: 'araras', destino: 'sao paulo', data: '2025-07-20', vagas: 3, valor: 35.00, localEmbarque: 'Rodoviária de Araras' },
    { id: 2, origem: 'leme', destino: 'campinas', data: '2025-07-22', vagas: 1, valor: 20.00, localEmbarque: 'Praça Central' }
];
let usuarios = [];
let proximoIdUsuario = 1;

// --- 5. DEFINIÇÃO DAS ROTAS DA API ---

// ROTA DE VERIFICAÇÃO (NOVA): Para testar se o servidor está no ar
app.get('/', (req, res) => {
    res.send('API do CaronaFácil está no ar e funcionando!');
});

// ROTA PÚBLICA PARA BUSCAR CARONAS
app.get('/api/caronas', (req, res) => {
    console.log('Recebida requisição GET para /api/caronas');
    res.json(caronasDisponiveis);
});

// ROTA PARA OFERECER CARONA
app.post('/api/caronas', (req, res) => {
    console.log('Recebida requisição POST para /api/caronas');
    const novaCarona = req.body;
    novaCarona.id = proximoIdCarona++;
    caronasDisponiveis.push(novaCarona);
    res.status(201).json(novaCarona);
});

// ROTA PARA CADASTRAR USUÁRIO
app.post('/api/register', async (req, res) => {
    console.log('Recebida requisição POST para /api/register');
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }
        if (usuarios.find(user => user.email === email)) {
            return res.status(400).json({ message: 'Este e-mail já está em uso.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const novoUsuario = { id: proximoIdUsuario++, email: email, password: hashedPassword };
        usuarios.push(novoUsuario);
        console.log('Usuários cadastrados:', usuarios);
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar cadastrar usuário.' });
    }
});

// ROTA PARA FAZER LOGIN
app.post('/api/login', async (req, res) => {
    console.log('Recebida requisição POST para /api/login');
    try {
        const { email, password } = req.body;
        const usuario = usuarios.find(user => user.email === email);
        if (!usuario) {
            return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
        }
        const senhaCorreta = await bcrypt.compare(password, usuario.password);
        if (!senhaCorreta) {
            return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
        }
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            'sua_chave_secreta_super_segura', // Em produção, use uma variável de ambiente
            { expiresIn: '1h' }
        );
        res.json({ message: 'Login bem-sucedido!', token: token });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar fazer login.' });
    }
});

// --- 6. INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor "CaronaFácil" rodando na porta ${PORT}`);
});