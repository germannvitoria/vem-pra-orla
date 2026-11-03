export type ResumoDia = {
  indice: number;
  classificacao: string;
  clima: {
    temperatura: number;
    sensacaoTermica: number;
    ventoKmh: number;
    probabilidadeChuva: number;
    tempMax: number;
    tempMin: number;
    codigoTempo: number;
  };
  ocorrencias: { tipo: string; local: string; impacto: string }[];
};

const TIPOS: Record<string, string> = {
  lixo: 'Lixo',
  poluicao_sonora: 'Poluição sonora',
  animal: 'Animal',
  seguranca: 'Segurança',
  outro: 'Outro',
};

const IMPACTOS: Record<string, string> = { baixo: 'baixo', medio: 'médio', alto: 'alto' };

// Os textos vêm de usuários (campo "local"), então precisam ser escapados.
function esc(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nota(n: number): string {
  return n.toFixed(1).replace('.', ',');
}

function descricaoTempo(codigo: number): string {
  if (codigo === 0) return 'Céu limpo';
  if (codigo <= 2) return 'Parcialmente nublado';
  if (codigo === 3) return 'Nublado';
  if (codigo <= 48) return 'Neblina';
  if (codigo <= 57) return 'Garoa';
  if (codigo <= 67) return 'Chuva';
  if (codigo <= 82) return 'Pancadas de chuva';
  return 'Tempestade';
}

function corDoIndice(indice: number): string {
  if (indice >= 3) return '#1f9860';
  if (indice >= 2) return '#b07005';
  return '#b91c1c';
}

export function montarEmail(resumo: ResumoDia, urlApp: string) {
  const { clima } = resumo;
  const cor = corDoIndice(resumo.indice);
  const assunto = `Vem Pra Orla: hoje o índice é ${nota(resumo.indice)}/5 (${resumo.classificacao})`;

  const ocorrencias =
    resumo.ocorrencias.length === 0
      ? '<p style="margin:0;color:#5a7a6a;font-size:14px;">Nenhuma ocorrência registrada nas últimas 24h.</p>'
      : resumo.ocorrencias
          .map(
            (o) =>
              `<p style="margin:0 0 6px;font-size:14px;color:#1a3a2a;">• <strong>${esc(TIPOS[o.tipo] ?? 'Ocorrência')}</strong> em ${esc(o.local)} <span style="color:#5a7a6a;">(impacto ${esc(IMPACTOS[o.impacto] ?? o.impacto)})</span></p>`,
          )
          .join('');

  const html = `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:0;background:#f2faf6;font-family:'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2faf6;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #c5e8d8;">
  <tr><td style="background:#1f9860;background-image:linear-gradient(135deg,#1f9860,#1F9498);padding:22px 24px;color:#ffffff;">
    <div style="font-size:20px;font-weight:800;">Vem Pra Orla</div>
    <div style="font-size:13px;opacity:.9;margin-top:2px;">Resumo de hoje · Orla do Guaíba, Porto Alegre</div>
  </td></tr>
  <tr><td style="padding:24px;text-align:center;">
    <div style="font-size:13px;font-weight:700;color:#5a7a6a;text-transform:uppercase;letter-spacing:.04em;">Índice de lazer</div>
    <div style="font-size:52px;font-weight:900;color:${cor};line-height:1.1;margin-top:6px;">${nota(resumo.indice)}<span style="font-size:24px;color:#5a7a6a;">/5</span></div>
    <div style="display:inline-block;margin-top:6px;padding:3px 14px;border-radius:20px;background:#f2faf6;color:${cor};font-weight:700;font-size:14px;">${esc(resumo.classificacao)}</div>
  </td></tr>
  <tr><td style="padding:0 24px 20px;">
    <div style="background:#f2faf6;border-radius:12px;padding:14px 16px;">
      <div style="font-size:13px;font-weight:700;color:#5a7a6a;text-transform:uppercase;margin-bottom:8px;">Clima agora</div>
      <div style="font-size:15px;color:#1a3a2a;"><strong>${Math.round(clima.temperatura)}°C</strong> · ${descricaoTempo(clima.codigoTempo)}</div>
      <div style="font-size:13px;color:#5a7a6a;margin-top:4px;">Sensação ${Math.round(clima.sensacaoTermica)}°C · Máx ${Math.round(clima.tempMax)}° / Mín ${Math.round(clima.tempMin)}° · Vento ${Math.round(clima.ventoKmh)} km/h · Chance de chuva ${clima.probabilidadeChuva}%</div>
    </div>
  </td></tr>
  <tr><td style="padding:0 24px 20px;">
    <div style="font-size:13px;font-weight:700;color:#5a7a6a;text-transform:uppercase;margin-bottom:8px;">Ocorrências recentes</div>
    ${ocorrencias}
  </td></tr>
  <tr><td style="padding:0 24px 24px;text-align:center;">
    <a href="${esc(urlApp)}" style="display:inline-block;background:#1f9860;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 24px;border-radius:10px;">Abrir o Vem Pra Orla</a>
  </td></tr>
  <tr><td style="padding:16px 24px;border-top:1px solid #c5e8d8;font-size:11px;color:#5a7a6a;text-align:center;line-height:1.5;">
    Você recebe este e-mail porque ativou o resumo diário no Vem Pra Orla. Para parar de receber, desative a opção no aplicativo.<br>
    O índice é uma estimativa e não substitui avisos oficiais. Projeto de TCC · IFRS Campus Porto Alegre.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { assunto, html };
}
