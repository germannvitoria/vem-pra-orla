# Bot de WhatsApp do Vem Pra Orla

Roda em um número de WhatsApp que participa de vários grupos. Todo dia de manhã
(07:00 de Brasília, por padrão) busca no backend o resumo das condições da orla
(índice de lazer, clima e ocorrências das últimas 24h) e envia a mesma mensagem
para **todos os grupos em que o número participa**.

Usa [whatsapp-web.js](https://github.com/wwebjs/whatsapp-web.js), que controla
um WhatsApp Web num Chromium headless.

## Como funciona

```
node-cron (07:00) ──► GET {BACKEND_URL}/notifications/summary  (header x-api-key)
                      │
                      ▼
               monta a mensagem (src/mensagem.ts)
                      │
                      ▼
      envia para cada grupo ativo, com intervalo aleatório entre eles
```

- Pula grupos dos quais o número saiu e grupos "só admins enviam" em que ele não é admin.
- Se o backend falhar, tenta 3 vezes; se continuar falhando, não envia nada naquele dia.
- Se um grupo der erro, segue para os próximos.

## Configuração

1. No **backend**, adicione ao `.env` uma chave longa e aleatória:

   ```
   BOT_API_KEY=<chave>
   ```

2. Aqui no `chatbot/`:

   ```bash
   npm install
   cp .env.example .env   # e preencha BOT_API_KEY com a mesma chave
   ```

3. Primeira execução: escaneie o QR code que aparece no terminal com o celular do
   número do bot (WhatsApp → Aparelhos conectados → Conectar um aparelho). A sessão
   fica salva em `.wwebjs_auth/` e não é pedida de novo.

## Comandos

| Comando                 | O que faz                                                   |
| ----------------------- | ----------------------------------------------------------- |
| `npm start`             | Fica rodando e envia todo dia no horário de `CRON_ENVIO`     |
| `npm run enviar-agora`  | Envia uma vez para todos os grupos e encerra (teste/manual) |
| `npm run listar-grupos` | Mostra ID e nome dos grupos (para `GRUPOS_IGNORADOS`)       |

Rode só **um** processo por vez: todos usam a mesma sessão do WhatsApp.

## Em produção

- O processo precisa ficar sempre ligado (VPS, Raspberry Pi, etc.). Use pm2,
  systemd ou Docker com reinício automático: o bot encerra com erro se o WhatsApp
  desconectar, para ser reiniciado.
- Em Linux sem interface gráfica, o Chromium precisa das bibliotecas do sistema
  (veja o guia de instalação do whatsapp-web.js).
- **Nunca** versione a pasta `.wwebjs_auth/`: ela equivale a estar logado no número.

## Cuidados

whatsapp-web.js não é uma API oficial do WhatsApp. Envios automáticos em massa
podem levar ao bloqueio do número. Para reduzir o risco: use um número dedicado,
mantenha o intervalo entre grupos (`INTERVALO_MIN_S`/`INTERVALO_MAX_S`) e só
coloque o número em grupos que querem receber o resumo.
