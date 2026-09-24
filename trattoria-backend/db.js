// db.js
// Configuração do banco de dados SQLite para o sistema de reservas.
// Usa better-sqlite3: simples, síncrono, sem precisar de outro serviço no Railway.
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('/app/data/reservas.db');

// Cria as tabelas caso ainda não existam.
db.exec(`
  CREATE TABLE IF NOT EXISTS mesas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero INTEGER NOT NULL UNIQUE,
    capacidade INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    data TEXT NOT NULL,        -- formato YYYY-MM-DD
    horario TEXT NOT NULL,     -- formato HH:MM
    pessoas INTEGER NOT NULL,
    observacoes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDENTE', -- PENDENTE | CONFIRMADA | RECUSADA
    mesa_id INTEGER NOT NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (mesa_id) REFERENCES mesas(id)
  );
`);

module.exports = db;
