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

  const largura = Math.max(0, Math.min(100, (resumo.indice / 5) * 100));

  const metrica = (rotulo: string, valor: string) =>
    `<td width="50%" style="padding:4px;"><div style="background:#f2faf6;border-radius:10px;padding:10px 12px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#1a3a2a;">${valor}</div><div style="font-size:11px;color:#5a7a6a;text-transform:uppercase;letter-spacing:.03em;margin-top:2px;">${rotulo}</div></div></td>`;

  const html = `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:0;background:#f2faf6;font-family:'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2faf6;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #c5e8d8;">
  <tr><td style="background:#1f9860;background-image:linear-gradient(135deg,#1f9860,#1F9498);padding:22px 24px;color:#ffffff;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:16px;"><img src="cid:logo" width="84" height="84" alt="Vem Pra Orla" style="display:block;border-radius:50%;border:0;"></td>
      <td>
        <div style="font-size:21px;font-weight:800;line-height:1.2;">Vem Pra Orla</div>
        <div style="font-size:13px;opacity:.92;margin-top:3px;">Resumo de hoje · Orla do Guaíba, Porto Alegre</div>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:26px 24px 8px;text-align:center;">
    <div style="font-size:12px;font-weight:700;color:#5a7a6a;text-transform:uppercase;letter-spacing:.06em;">Índice de lazer</div>
    <div style="font-size:56px;font-weight:900;color:${cor};line-height:1.1;margin-top:6px;">${nota(resumo.indice)}<span style="font-size:24px;color:#5a7a6a;font-weight:700;">/5</span></div>
    <div style="display:inline-block;margin-top:6px;padding:4px 16px;border-radius:20px;background:#f2faf6;color:${cor};font-weight:700;font-size:14px;border:1px solid #c5e8d8;">${esc(resumo.classificacao)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;"><tr><td style="background:#e0f0ea;border-radius:6px;height:10px;font-size:0;line-height:0;">
      <div style="width:${largura.toFixed(0)}%;height:10px;border-radius:6px;background:${cor};font-size:0;line-height:0;">&nbsp;</div>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:18px 20px 6px;">
    <div style="font-size:12px;font-weight:700;color:#5a7a6a;text-transform:uppercase;letter-spacing:.06em;padding:0 4px 8px;">Clima agora · ${descricaoTempo(clima.codigoTempo)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>${metrica('Temperatura', `${Math.round(clima.temperatura)}°C`)}${metrica('Sensação', `${Math.round(clima.sensacaoTermica)}°C`)}</tr>
      <tr>${metrica('Vento', `${Math.round(clima.ventoKmh)} km/h`)}${metrica('Chance de chuva', `${clima.probabilidadeChuva}%`)}</tr>
    </table>
    <div style="font-size:12px;color:#5a7a6a;text-align:center;padding-top:6px;">Máxima ${Math.round(clima.tempMax)}° · Mínima ${Math.round(clima.tempMin)}°</div>
  </td></tr>
  <tr><td style="padding:16px 24px 8px;">
    <div style="font-size:12px;font-weight:700;color:#5a7a6a;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Ocorrências recentes</div>
    ${ocorrencias}
  </td></tr>
  <tr><td style="padding:16px 24px 26px;text-align:center;">
    <a href="${esc(urlApp)}" style="display:inline-block;background:#1f9860;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;">Abrir o Vem Pra Orla</a>
  </td></tr>
  <tr><td style="padding:16px 24px;border-top:1px solid #c5e8d8;background:#fafdfb;font-size:11px;color:#5a7a6a;text-align:center;line-height:1.6;">
    Você recebe este e-mail porque ativou o resumo diário no Vem Pra Orla. Para parar de receber, desative a opção em Notificações, dentro do aplicativo.<br>
    O índice é uma estimativa e não substitui avisos oficiais.<br>
    Projeto de TCC · IFRS Campus Porto Alegre
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { assunto, html };
}
