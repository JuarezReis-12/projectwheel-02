const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.json());

// CONFIGURAÇÃO DO PHPMYADMIN (MYSQL)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',             
    password: '',             
    database: 'projeto_wheel', // Certifique-se de que este é o nome do banco no phpMyAdmin
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste de conexão
db.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar no phpMyAdmin:', err.message);
    } else {
        console.log('Sucesso: Conectado ao banco de dados do phpMyAdmin!');
        connection.release();
    }
});

// ROTA PARA SALVAR OS DADOS
app.post('/api/perfis', (req, res) => {
    const { perfilDirecao, microcontrolador, ffbForce, ffbDamper, ffbFriction, jogos } = req.body;

    const sql = `INSERT INTO perfis_ffb 
                 (perfil_direcao, microcontrolador, forca_ffb, amortecimento, friccao, jogos) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    const jogosJSON = JSON.stringify(jogos || []);

    db.query(sql, [perfilDirecao, microcontrolador, ffbForce, ffbDamper, ffbFriction, jogosJSON], (err, result) => {
        if (err) {
            console.error('Erro ao executar o SQL:', err);
            return res.status(500).json({ error: 'Erro interno ao salvar os dados no banco.' });
        }
        res.status(201).json({ 
            message: 'Configuração gravada com sucesso!', 
            id: result.insertId 
        });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor do Project Wheel ativo em http://localhost:${PORT}`);
});