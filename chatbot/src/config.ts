import 'dotenv/config';

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida (veja .env.example)`);
  }
  return valor;
}

export const config = {
  backendUrl: (process.env.BACKEND_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  botApiKey: obrigatoria('BOT_API_KEY'),
  cronEnvio: process.env.CRON_ENVIO ?? '0 7 * * *',
  fuso: process.env.TZ_ENVIO ?? 'America/Sao_Paulo',
  gruposIgnorados: new Set(
    (process.env.GRUPOS_IGNORADOS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  ),
  intervaloMinMs: Number(process.env.INTERVALO_MIN_S ?? 5) * 1000,
  intervaloMaxMs: Number(process.env.INTERVALO_MAX_S ?? 15) * 1000,
};
