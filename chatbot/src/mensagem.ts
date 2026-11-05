import type { ResumoDia } from './backend.js';

// Mesmos rótulos usados no e-mail (backend/src/notifications/email-template.ts).
const TIPOS: Record<string, string> = {
  lixo: 'Lixo',
  poluicao_sonora: 'Poluição sonora',
  animal: 'Animal',
  seguranca: 'Segurança',
  outro: 'Outro',
};

const IMPACTOS: Record<string, string> = { baixo: 'baixo', medio: 'médio', alto: 'alto' };

function nota(n: number): string {
  return n.toFixed(1).replace('.', ',');
}

function graus(n: number): string {
  return `${Math.round(n)}°C`;
}

function descricaoTempo(codigo: number): string {
  if (codigo === 0) return '☀️ Céu limpo';
  if (codigo <= 2) return '🌤️ Parcialmente nublado';
  if (codigo === 3) return '☁️ Nublado';
  if (codigo <= 48) return '🌫️ Neblina';
  if (codigo <= 57) return '🌦️ Garoa';
  if (codigo <= 67) return '🌧️ Chuva';
  if (codigo <= 82) return '🌧️ Pancadas de chuva';
  return '⛈️ Tempestade';
}

function iconeIndice(indice: number): string {
  if (indice >= 3) return '🟢';
  if (indice >= 2) return '🟡';
  return '🔴';
}

// Textos de usuários (campo "local") não podem quebrar a formatação do WhatsApp.
function limpar(texto: string): string {
  return texto.replace(/[*_~`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function dataDeHoje(fuso: string): string {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    timeZone: fuso,
  }).format(new Date());
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function montarMensagem(resumo: ResumoDia, fuso: string): string {
  const { clima } = resumo;

  const ocorrencias =
    resumo.ocorrencias.length === 0
      ? 'Nenhuma ocorrência registrada nas últimas 24h. ✅'
      : resumo.ocorrencias
          .map(
            (o) =>
              `• *${TIPOS[o.tipo] ?? 'Ocorrência'}* em ${limpar(o.local)} (impacto ${IMPACTOS[o.impacto] ?? o.impacto})`,
          )
          .join('\n');

  return [
    `🌊 *Vem Pra Orla — ${dataDeHoje(fuso)}*`,
    '',
    `${iconeIndice(resumo.indice)} Índice de lazer: *${nota(resumo.indice)}/5* (${resumo.classificacao})`,
    '',
    `*Clima agora*`,
    `${descricaoTempo(clima.codigoTempo)}, ${graus(clima.temperatura)} (sensação ${graus(clima.sensacaoTermica)})`,
    `🌡️ Mín. ${graus(clima.tempMin)} / Máx. ${graus(clima.tempMax)}`,
    `☔ Chance de chuva: ${Math.round(clima.probabilidadeChuva)}%`,
    `💨 Vento: ${Math.round(clima.ventoKmh)} km/h`,
    '',
    `*Ocorrências recentes*`,
    ocorrencias,
    '',
    `Veja mais e registre ocorrências: ${resumo.urlApp}`,
  ].join('\n');
}
