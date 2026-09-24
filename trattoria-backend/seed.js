// seed.js
// Roda uma vez (npm run seed) pra popular a tabela de mesas.
// Ajuste os números e capacidades conforme o salão real do restaurante.
const db = require('./db');

const mesas = [
  { numero: 1, capacidade: 2 },
  { numero: 2, capacidade: 2 },
  { numero: 3, capacidade: 4 },
  { numero: 4, capacidade: 4 },
  { numero: 5, capacidade: 6 },
  { numero: 6, capacidade: 8 },
];

const inserir = db.prepare('INSERT OR IGNORE INTO mesas (numero, capacidade) VALUES (?, ?)');

for (const mesa of mesas) {
  inserir.run(mesa.numero, mesa.capacidade);
}

console.log(`${mesas.length} mesas cadastradas (ou já existentes no banco).`);
