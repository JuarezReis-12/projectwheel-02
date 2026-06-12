const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// Permite a comunicação segura entre o Front-end e o Back-end
app.use(cors());
app.use(express.json());

// ==========================================================
// 1. CONFIGURAÇÃO DO BANCO DE DADOS (phpMyAdmin)
// ==========================================================
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',             // Usuário padrão do XAMPP
    password: '',             // Senha padrão do XAMPP (vazia)
    database: 'projeto_wheel', // Nome exato do seu banco de dados
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste automático de conexão com o banco ao iniciar o servidor
db.getConnection((err, connection) => {
    if (err) {
        console.error('Erro crítico ao conectar no phpMyAdmin:', err.message);
    } else {
        console.log('Sucesso: Conectado ao banco de dados do phpMyAdmin!');
        connection.release();
    }
});

// ==========================================================
// 2. ROTA PARA RECEBER E SALVAR OS DADOS DO SCRIPT2.JS
// ==========================================================
app.post('/api/perfis', (req, res) => {
    // Coleta as variáveis com os nomes exatos enviados pelo script2.js
    const { perfilJogador, microcontrolador, potencia, feedbackMotor, nivelAsfalto, jogos } = req.body;

    // Comando SQL correspondente às colunas da sua tabela perfis_ffb
    const sql = `INSERT INTO perfis_ffb 
                 (perfil_direcao, microcontrolador, forca_ffb, amortecimento, friccao, jogos) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    // Converte a lista de jogos em formato texto string JSON para o MySQL aceitar
    const jogosJSON = JSON.stringify(jogos || []);

    // Executa a inserção mapeando os dados para as colunas corretas
    db.query(sql, [perfilJogador, microcontrolador, potencia, feedbackMotor, nivelAsfalto, jogosJSON], (err, result) => {
        if (err) {
            console.error('Erro ao executar o comando SQL:', err);
            return res.status(500).json({ error: 'Erro interno ao salvar os dados no banco.' });
        }
        
        // Retorna o ID gerado para o Front-end exibir o Toast de sucesso
        res.status(201).json({ 
            message: 'Configuração gravada com sucesso!', 
            id: result.insertId 
        });
    });
});

// ==========================================================
// 3. INICIALIZAÇÃO DO SERVIDOR (PORTA FIXA 3000)
// ==========================================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor do Project Wheel ativo em http://localhost:${PORT}`);
});