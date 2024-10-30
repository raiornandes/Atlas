const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'novo_usuario',
  password: 'nova_senha',
  database: 'atlas'
});

connection.connect(error => {
  if (error) throw error;
  console.log('Conectado ao banco de dados MySQL');
});

app.get('/dados-cidades', (req, res) => {
  connection.query('SELECT * FROM cidades', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.get('/dados-restaurantes', (req, res) => {
  console.log('Requisição recebida para /dados-restaurantes');
  connection.query('SELECT * FROM restaurants', (error, results) => {
    if (error) {
      console.error('Erro ao consultar restaurantes:', error);
      return res.status(500).send('Erro ao consultar o banco de dados.');
    }
    res.json(results);
  });
});

app.get('/dados-compras', (req, res) => {
  connection.query('SELECT * FROM shopping', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.get('/dados-turismo', (req, res) => {
  connection.query('SELECT * FROM tourism', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.get('/dados-atracoes', (req, res) => {
  connection.query('SELECT * FROM attractions', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});