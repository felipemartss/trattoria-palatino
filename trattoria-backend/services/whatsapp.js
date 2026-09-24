// services/whatsapp.js
// Responsável por conversar com a Evolution API e mandar a notificação
// de nova reserva pro WhatsApp do restaurante.

const EVOLUTION_URL = process.env.EVOLUTION_URL;
const EVOLUTION_APIKEY = process.env.EVOLUTION_APIKEY;
const INSTANCE_NAME = process.env.INSTANCE_NAME;
const NUMERO_RESTAURANTE = process.env.NUMERO_RESTAURANTE;

function formatarDataBR(iso) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function montarMensagem(reserva, mesa) {
  let msg = `📋 *Nova reserva pendente*\n\n`;
  msg += `*Nome:* ${reserva.nome}\n`;
  msg += `*Telefone:* ${reserva.telefone}\n`;
  msg += `*Data:* ${formatarDataBR(reserva.data)}\n`;
  msg += `*Horário:* ${reserva.horario}\n`;
  msg += `*Pessoas:* ${reserva.pessoas}\n`;
  msg += `*Mesa:* ${mesa.numero} (capacidade ${mesa.capacidade})\n`;
  if (reserva.observacoes) msg += `*Observações:* ${reserva.observacoes}\n`;
  msg += `\nReserva #${reserva.id} — confirme com o cliente pelo telefone acima.`;
  return msg;
}

async function notificarNovaReserva(reserva, mesa) {
  const mensagem = montarMensagem(reserva, mesa);

  const resposta = await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE_NAME}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: EVOLUTION_APIKEY,
    },
    body: JSON.stringify({
      number: NUMERO_RESTAURANTE,
      text: mensagem,
    }),
  });

  if (!resposta.ok) {
    const erro = await resposta.text();
    throw new Error(`Evolution API respondeu ${resposta.status}: ${erro}`);
  }
}

module.exports = { notificarNovaReserva };
