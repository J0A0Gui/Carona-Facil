// --- CaronaFácil Back-end ---
// VERSÃO CORRIGIDA - ORDEM DE INICIALIZAÇÃO AJUSTADA

// --- 1. IMPORTAÇÃO DE DEPENDÊNCIAS ---
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- 2. INICIALIZAÇÃO DO APLICATIVO EXPRESS ---
// A VARIÁVEL 'app' É CRIADA AQUI. TUDO QUE USA 'app' DEVE VIR DEPOIS DESTA LINHA.
const app = express();
const PORT = 3000;

// --- 3. CONFIGURAÇÃO DE MIDDLEWARES ---
// Agora que 'app' existe, podemos usá-lo.
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
// Todas as rotas usam a variável 'app' e devem vir depois de sua criação.

// ROTA PÚBLICA PARA BUSCAR CARONAS
app.get('/api/caronas', (req, res) => {
    console.log('Recebida requisição GET para /api/caronas');
    res.json(caronasDisponiveis);
});

// ROTA PARA OFERECER CARONA
app.post('/api/caronas', (req, res) => {
    const novaCarona = req.body;
    novaCarona.id = proximoIdCarona++;
    caronasDisponiveis.push(novaCarona);
    res.status(201).json(novaCarona);
});

// ROTA PARA CADASTRAR USUÁRIO
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (usuarios.find(user => user.email === email)) {
            return res.status(400).json({ message: 'Este e-mail já está em uso.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const novoUsuario = { id: proximoIdUsuario++, email: email, password: hashedPassword };
        usuarios.push(novoUsuario);
        console.log('Usuários cadastrados:', usuarios);
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao tentar cadastrar usuário.' });
    }
});

// ROTA PARA FAZER LOGIN
app.post('/api/login', async (req, res) => {
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
            'sua_chave_secreta_super_segura',
            { expiresIn: '1h' }
        );
        res.json({ message: 'Login bem-sucedido!', token: token });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao tentar fazer login.' });
    }
});

// --- 6. INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor "CaronaFácil" rodando na porta ${PORT}`);
    console.log('API disponível em http://localhost:3000/api/caronas');
});