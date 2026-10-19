# Trattoria Backend

Backend do sistema de reservas: recebe o formulário do site, verifica
disponibilidade de mesa, salva a reserva e notifica o restaurante via WhatsApp
(Evolution API).

## Como rodar local

```bash
npm install
cp .env.example .env   # depois edite com os valores reais da sua instância Evolution API
npm run seed            # popula a tabela de mesas
npm start
```

O servidor sobe em `http://localhost:3000`.

## Endpoints

- `POST /reservas` — cria uma reserva. Body esperado:
  ```json
  { "nome": "...", "telefone": "...", "data": "2026-10-01", "horario": "20:00", "pessoas": 4, "observacoes": "..." }
  ```
- `GET /reservas` — lista todas as reservas (mais recentes primeiro).
- `PATCH /reservas/:id/status` — atualiza o status. Body: `{ "status": "CONFIRMADA" }` ou `{ "status": "RECUSADA" }`.

