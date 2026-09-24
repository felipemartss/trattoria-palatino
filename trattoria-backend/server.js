// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { notificarNovaReserva } = require('./services/whatsapp');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Campos que o formulário do site precisa mandar em toda reserva.
const CAMPOS_OBRIGATORIOS = ['nome', 'telefone', 'data', 'horario', 'pessoas'];

function validarReserva(body) {
  for (const campo of CAMPOS_OBRIGATORIOS) {
    if (!body[campo]) return `Campo obrigatório faltando: ${campo}`;
  }
  if (Number(body.pessoas) <= 0) return 'Número de pessoas inválido';
  return null;
}

// Cria uma nova reserva: valida, procura mesa, salva como PENDENTE e notifica o restaurante.
app.post('/reservas', async (req, res) => {
  const erro = validarReserva(req.body);
  if (erro) return res.status(400).json({ ok: false, erro });

  const { nome, telefone, data, horario, pessoas, observacoes } = req.body;

  const resultado = db.prepare(`
  INSERT INTO reservas (nome, telefone, data, horario, pessoas, observacoes)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(nome, telefone, data, horario, pessoas, observacoes || null);

  const reserva = db.prepare('SELECT * FROM reservas WHERE id = ?').get(resultado.lastInsertRowid);

  try {
    await notificarNovaReserva(reserva);
  } catch (erroWhatsapp) {
    // A reserva já foi salva no banco mesmo se o WhatsApp falhar —
    // o cliente não deve ficar sem resposta por causa disso.
    console.error('Falha ao notificar WhatsApp:', erroWhatsapp.message);
  }

  res.json({ ok: true, reserva });
});

// Lista todas as reservas (útil pro funcionário ver o que está pendente).
app.get('/reservas', (req, res) => {
  const reservas = db.prepare('SELECT * FROM reservas ORDER BY criado_em DESC').all();
  res.json(reservas);
});

// Confirmar ou recusar manualmente uma reserva, depois que o funcionário falar com o cliente.
app.patch('/reservas/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['CONFIRMADA', 'RECUSADA'].includes(status)) {
    return res.status(400).json({ ok: false, erro: 'Status inválido' });
  }
  db.prepare('UPDATE reservas SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => console.log(`Backend rodando na porta ${PORTA}`));
