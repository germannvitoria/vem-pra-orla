import { config } from './config.js';

// Formato devolvido por GET /notifications/summary no backend.
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
  ocorrencias: { tipo: string; local: string; impacto: string; criadoEm: string }[];
  urlApp: string;
};

const TENTATIVAS = 3;

// Busca o resumo no backend, com algumas tentativas (o backend pode estar
// "acordando" ou a API de clima pode falhar momentaneamente).
export async function buscarResumo(): Promise<ResumoDia> {
  let ultimoErro: unknown;
  for (let i = 1; i <= TENTATIVAS; i++) {
    try {
      const res = await fetch(`${config.backendUrl}/notifications/summary`, {
        headers: { 'x-api-key': config.botApiKey },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        throw new Error(`Backend respondeu ${res.status}: ${await res.text()}`);
      }
      return (await res.json()) as ResumoDia;
    } catch (erro) {
      ultimoErro = erro;
      console.warn(`[backend] tentativa ${i}/${TENTATIVAS} falhou:`, erro);
      if (i < TENTATIVAS) await new Promise((r) => setTimeout(r, 30_000 * i));
    }
  }
  throw ultimoErro;
}
