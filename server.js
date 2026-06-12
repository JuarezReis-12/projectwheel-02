const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.json());

// CONFIGURAÇÃO DO BANCO DE DADOS
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',             
    password: '',             
    database: 'Projeto_wheel', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste de conexão
db.getConnection((err, connection) => {
    if (err) {
        console.error('Erro crítico ao conectar no phpMyAdmin:', err.message);
    } else {
        console.log('Sucesso: Conectado ao banco de dados do phpMyAdmin!');
        connection.release();
    }
});

// 1. ROTA DE INSERÇÃO (C)
app.post('/api/perfis', (req, res) => {
    const { perfilJogador, microcontrolador, potencia, feedbackMotor, nivelAsfalto, jogos } = req.body;
    const sql = `INSERT INTO perfis_ffb (perfil_direcao, microcontrolador, forca_ffb, amortecimento, friccao, jogos) VALUES (?, ?, ?, ?, ?, ?)`;
    const jogosJSON = JSON.stringify(jogos || []);

    db.query(sql, [perfilJogador, microcontrolador, potencia, feedbackMotor, nivelAsfalto, jogosJSON], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Gravado com sucesso!', id: result.insertId });
    });
});

// 2. ROTA DE ATUALIZAÇÃO - UPDATE (U)
// O :id na URL identifica qual perfil será modificado
app.put('/api/perfis/:id', (req, res) => {
    const { id } = req.params;
    const { perfilJogador, microcontrolador, potencia, feedbackMotor, nivelAsfalto, jogos } = req.body;
    
    const sql = `UPDATE perfis_ffb 
                 SET perfil_direcao = ?, microcontrolador = ?, forca_ffb = ?, amortecimento = ?, friccao = ?, jogos = ? 
                 WHERE id = ?`;
    const jogosJSON = JSON.stringify(jogos || []);

    db.query(sql, [perfilJogador, microcontrolador, potencia, feedbackMotor, nivelAsfalto, jogosJSON, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar no SQL:', err);
            return res.status(500).json({ error: 'Erro ao atualizar dados.' });
        }
        res.json({ message: 'Perfil atualizado com sucesso!' });
    });
});

// 3. ROTA DE EXCLUSÃO - DELETE (D)
// O :id na URL identifica qual perfil será deletado
app.delete('/api/perfis/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM perfis_ffb WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao deletar no SQL:', err);
            return res.status(500).json({ error: 'Erro ao deletar dados.' });
        }
        res.json({ message: 'Perfil deletado com sucesso!' });
    });
});

// INICIALIZAÇÃO
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor do Project Wheel ativo em http://localhost:${PORT}`);
});