// db.js
// Configuração do banco de dados SQLite para o sistema de reservas.
// Usa better-sqlite3: simples, síncrono, sem precisar de outro serviço no Railway.
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('/app/data/reservas.db');

// Cria as tabelas caso ainda não existam.
db.exec(`
  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    pessoas INTEGER NOT NULL,
    observacoes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDENTE',
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
