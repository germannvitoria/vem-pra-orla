import cron from 'node-cron';
import qrcode from 'qrcode-terminal';
import wwebjs from 'whatsapp-web.js';
import { config } from './config.js';
import { enviarParaTodosOsGrupos, listarGruposAtivos } from './envio.js';

const { Client, LocalAuth } = wwebjs;

// Modos de execução:
//   (padrão)          fica rodando e envia todo dia no horário de CRON_ENVIO
//   --agora           envia uma vez imediatamente e encerra (teste/manual)
//   --listar-grupos   mostra nome e ID dos grupos e encerra
const modoAgora = process.argv.includes('--agora');
const modoListar = process.argv.includes('--listar-grupos');

if (!cron.validate(config.cronEnvio)) {
  throw new Error(`CRON_ENVIO inválido: "${config.cronEnvio}"`);
}

const client = new Client({
  // Guarda a sessão em .wwebjs_auth/ para não precisar ler o QR code a cada início.
  authStrategy: new LocalAuth({ clientId: 'vem-pra-orla' }),
  puppeteer: {
    headless: true,
    // Necessário ao rodar em servidores Linux/containers.
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', (qr) => {
  console.log('Escaneie o QR code com o WhatsApp do número do bot (Aparelhos conectados):');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => console.log('[whatsapp] autenticado.'));
client.on('auth_failure', (msg) => console.error('[whatsapp] falha na autenticação:', msg));
client.on('disconnected', (motivo) => {
  console.error('[whatsapp] desconectado:', motivo);
  // Sai com erro para que o gerenciador de processos (pm2, systemd, Docker) reinicie.
  process.exit(1);
});

let agendado = false;

client.on('ready', async () => {
  console.log(`[whatsapp] pronto como ${client.info.pushname} (${client.info.wid.user}).`);

  if (modoListar) {
    const grupos = await listarGruposAtivos(client);
    for (const g of grupos) console.log(`${g.id._serialized}  ${g.name}`);
    console.log(`${grupos.length} grupo(s).`);
    await encerrar(0);
    return;
  }

  if (modoAgora) {
    await enviarParaTodosOsGrupos(client);
    await encerrar(0);
    return;
  }

  // O evento "ready" pode disparar de novo após uma reconexão: agenda uma vez só.
  if (!agendado) {
    cron.schedule(config.cronEnvio, () => void enviarParaTodosOsGrupos(client), {
      timezone: config.fuso,
    });
    agendado = true;
    console.log(`[agenda] envio diário agendado: "${config.cronEnvio}" (${config.fuso}).`);
  }
});

async function encerrar(codigo: number) {
  try {
    await client.destroy();
  } finally {
    process.exit(codigo);
  }
}

process.on('SIGINT', () => void encerrar(0));
process.on('SIGTERM', () => void encerrar(0));

console.log('[whatsapp] iniciando...');
await client.initialize();
