## 🍝 Trattoria Palatino 

Site com sistemas de reservas para a Trattoria Palatino, restaurante de culinaria italiana em Monte Carmelo - MG.
O projeto veio da necessidade real da trattoria: apresentar o cardápio, mostrar a localização e os horarios de abertura e fechamento, 
além de receber pedidos de reservas de mesa direto pelo site.

Site no ar: 

---

## Funcionalidades: 
Front-end: 
> Layout responsivo, pensado primeiro para celular
> Menu hambúrguer com gaveta em tela cheia no mobile
> Cardápio com abas Almoço e Jantar
> Carrossel de pratos com setas no desktop e deslize (swipe) com indicadores no mobile
> Busca de pratos na barra de navegação
> Formulário de reserva com:
  - máscara de telefone
  - validação dos campos com mensagens de erro por campo
  - horários disponíveis que mudam conforme o dia da semana e o horário de funcionamento (almoço e jantar)
> Seção de horários e contato, com links para Instagram e WhatsApp
> Link para o cardápio completo

Back-end: 
> API em Node.js + Express com o endpoint POST /reservas
> Fluxo planejado: toda reserva é salva como PENDENTE e o restaurante recebe uma notificação no WhatsApp com os dados. 
O próprio restaurante avalia a disponibilidade e confirma direto com o cliente, pelo nome e telefone informados.

---

## 🛠️ Tecnologias
 
| Camada | Tecnologias |
| --- | --- |
| Frontend | HTML5, CSS3 (modularizado em arquivos por seção), JavaScript puro |
| Backend | Node.js, Express |
| Integração planejada | Evolution API (WhatsApp) |
| Hospedagem | Railway |
| Ferramentas | Git, GitHub, VS Code |


 ## 🚀 Como rodar localmente
 
**Pré-requisito:** [Node.js](https://nodejs.org/) instalado.
 
```bash
# 1. Clone o repositório
git clone https://github.com/felipemartss/trattoria-palatino.git
cd trattoria-palatino
```
---

**Frontend**
 
O site é estático. A forma mais simples é servir a pasta raiz:
 
```bash
npx serve .
```
 
Ou abra o `index.html` com a extensão Live Server do VS Code.
 
**Backend**
 
```bash
cd trattoria-backend
npm install
npm start
```
 
> O `.env` não é versionado. Crie um arquivo `.env` dentro de `trattoria-backend/` com as variáveis necessárias (veja `.env.example`, quando disponível).

---

 ## 📡 API
 
### `POST /reservas`
 
Registra uma solicitação de reserva.
 
Exemplo de corpo da requisição:
 
```json
{
  "nome": "Maria Silva",
  "telefone": "(34) 99999-9999",
  "data": "2026-11-20",
  "horario": "20:00",
  "pessoas": 4,
  "observacoes": "Aniversário"
}
```
A reserva é criada com status `PENDENTE` e aguarda a confirmação do restaurante.
 
---

## 👤 Autor
 
**Felipe Martins**
Estudante de Sistemas de Informação - UFU
GitHub: [@felipemartss](https://github.com/felipemartss)
 
---
