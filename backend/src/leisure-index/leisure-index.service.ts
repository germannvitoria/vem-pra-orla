import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { WeatherService } from '../weather/weather.service.js';
import type { WeatherNow } from '../weather/weather.service.js';

// Parâmetros do índice (documentar no TCC)
const PESO_CLIMA = 0.6;
const PESO_OCORRENCIAS = 0.4;
const JANELA_HORAS = 24;
const PENALIDADE_IMPACTO: Record<string, number> = {
  baixo: 0.3,
  medio: 0.7,
  alto: 1.5,
};

const limitar = (n: number) => Math.min(5, Math.max(0, n));
const arredondar = (n: number) => Math.round(n * 10) / 10;

function notaClima(w: WeatherNow): number {
  let nota = 5;

  // Chuva: agora ou prevista
  if (w.chuvaMm >= 0.5) nota -= 3;
  else if (w.probabilidadeChuva >= 70) nota -= 2.5;
  else if (w.probabilidadeChuva >= 40) nota -= 1.2;
  else if (w.probabilidadeChuva >= 20) nota -= 0.4;

  // Conforto térmico (sensação térmica)
  const t = w.sensacaoTermica;
  if (t < 10 || t > 36) nota -= 2;
  else if (t < 15 || t > 33) nota -= 1;
  else if (t < 18 || t > 30) nota -= 0.4;

  // Vento
  if (w.ventoKmh > 40) nota -= 1.5;
  else if (w.ventoKmh > 25) nota -= 0.7;

  // Tempestade (códigos 95 a 99): dia inadequado
  if (w.codigoTempo >= 95) nota = Math.min(nota, 0.5);

  return limitar(nota);
}

function classificar(indice: number): string {
  if (indice >= 4) return 'Ótimo';
  if (indice >= 3) return 'Bom';
  if (indice >= 2) return 'Regular';
  return 'Ruim';
}

@Injectable()
export class LeisureIndexService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly weatherService: WeatherService,
  ) {}

  async calculate() {
    const clima = await this.weatherService.getCurrent();

    const desde = new Date(Date.now() - JANELA_HORAS * 60 * 60 * 1000);
    const ocorrencias = await this.prisma.occurrence.findMany({
      where: { criadoEm: { gte: desde } },
    });

    // Ocorrências mais antigas pesam menos (de 100% a 50% ao longo da janela)
    let penalidade = 0;
    for (const o of ocorrencias) {
      const horas = (Date.now() - o.criadoEm.getTime()) / (60 * 60 * 1000);
      const peso = 1 - (horas / JANELA_HORAS) * 0.5;
      penalidade += (PENALIDADE_IMPACTO[o.impacto] ?? 0) * peso;
    }

    const nClima = notaClima(clima);
    const nOcorrencias = limitar(5 - penalidade);
    const indice = arredondar(
      PESO_CLIMA * nClima + PESO_OCORRENCIAS * nOcorrencias,
    );

    return {
      indice,
      classificacao: classificar(indice),
      fatores: {
        notaClima: arredondar(nClima),
        notaOcorrencias: arredondar(nOcorrencias),
        ocorrenciasConsideradas: ocorrencias.length,
      },
      clima,
    };
  }
}