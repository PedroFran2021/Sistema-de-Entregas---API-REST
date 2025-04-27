const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // ou 'mysql', dependendo do seu banco de dados
const { generatePdf } = require('./pdfUtils'); // Arquivo auxiliar para gerar o PDF
const app = express();
app.use(cors());
app.use(express.json());

// Configuração do banco de dados (PostgreSQL)
const pool = new Pool({
    user: 'seu_usuario',
    host: 'localhost',
    database: 'nome_do_banco',
    password: 'sua_senha',
    port: 5432, // Porta padrão do PostgreSQL
});

// Função auxiliar para executar queries no banco de dados
const query = async (text, params) => {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result.rows;
    } finally {
        client.release();
    }
};

// Rota para obter todas as entregas
app.get('/entregas', async (req, res) => {
    try {
        const entregas = await query('SELECT * FROM entregas');
        res.json(entregas);
    } catch (error) {
        console.error("Erro ao buscar entregas:", error);
        res.status(500).json({ error: "Erro ao buscar entregas" });
    }
});

// Rota para criar uma nova entrega
app.post('/entregas', async (req, res) => {
    const { destinatario, endereco, produto, status } = req.body;
    try {
        const novaEntrega = await query(
            'INSERT INTO entregas (destinatario, endereco, produto, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [destinatario, endereco, produto, status]
        );
        res.status(201).json(novaEntrega[0]);
    } catch (error) {
        console.error("Erro ao criar entrega:", error);
        res.status(500).json({ error: "Erro ao criar entrega" });
    }
});

// Rota para atualizar uma entrega
app.put('/entregas/:id', async (req, res) => {
    const { id } = req.params;
    const { destinatario, endereco, produto, status } = req.body;
    try {
        const entregaAtualizada = await query(
            'UPDATE entregas SET destinatario = $1, endereco = $2, produto = $3, status = $4 WHERE id = $5 RETURNING *',
            [destinatario, endereco, produto, status, id]
        );
        if (entregaAtualizada.length === 0) {
            return res.status(404).json({ error: "Entrega não encontrada" });
        }
        res.json(entregaAtualizada[0]);
    } catch (error) {
        console.error("Erro ao atualizar entrega:", error);
        res.status(500).json({ error: "Erro ao atualizar entrega" });
    }
});

// Rota para excluir uma entrega
app.delete('/entregas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM entregas WHERE id = $1 RETURNING *', [id]);
        if (result.length === 0) {
            return res.status(404).json({ error: "Entrega não encontrada" });
        }
        res.json({ message: "Entrega excluída com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir entrega:", error);
        res.status(500).json({ error: "Erro ao excluir entrega" });
    }
});

// Nova rota para gerar o PDF
app.get('/gerar-pdf', async (req, res) => {
    try {
        const entregas = await query('SELECT * FROM entregas');
        if (entregas.length === 0) {
            return res.status(404).json({ error: "Nenhuma entrega encontrada para gerar PDF" });
        }
        const pdfBuffer = await generatePdf(entregas); // Chama a função para gerar o PDF
        res.contentType('application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        res.status(500).json({ error: "Erro ao gerar PDF" });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
