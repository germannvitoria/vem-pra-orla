// Sugestões de atividades por regras simples sobre o clima atual e o índice de lazer.
// São heurísticas (limites escolhidos por bom senso), não uma recomendação especializada.

export type ClimaAtual = {
  sensacaoTermica: number
  ventoKmh: number
  probabilidadeChuva: number
  chuvaMm: number
  codigoTempo: number
}

export type Atividade = { emoji: string; nome: string; motivo: string }

type Regra = Atividade & { vale: (c: ClimaAtual, indice: number) => boolean }

const semChuva = (c: ClimaAtual, limite: number) => c.chuvaMm < 0.5 && c.probabilidadeChuva < limite

const REGRAS: Regra[] = [
  {
    emoji: '🌅',
    nome: 'Pôr do sol no Guaíba',
    motivo: 'Céu aberto e sem previsão de chuva',
    vale: (c, i) => c.codigoTempo <= 2 && semChuva(c, 30) && i >= 3,
  },
  {
    emoji: '🧉',
    nome: 'Chimarrão na orla',
    motivo: 'Temperatura agradável e vento fraco',
    vale: (c, i) => semChuva(c, 30) && c.sensacaoTermica >= 18 && c.sensacaoTermica <= 30 && c.ventoKmh <= 25 && i >= 3,
  },
  {
    emoji: '🚴',
    nome: 'Pedalar',
    motivo: 'Sem chuva e vento tranquilo',
    vale: (c, i) => semChuva(c, 40) && c.sensacaoTermica >= 15 && c.sensacaoTermica <= 30 && c.ventoKmh <= 20 && i >= 3,
  },
  {
    emoji: '🏃',
    nome: 'Corrida',
    motivo: 'Temperatura boa para se exercitar',
    vale: (c, i) => semChuva(c, 40) && c.sensacaoTermica >= 10 && c.sensacaoTermica <= 26 && c.ventoKmh <= 25 && i >= 3,
  },
  {
    emoji: '🪁',
    nome: 'Soltar pipa',
    motivo: 'Vento moderado e sem chuva',
    vale: (c, i) => semChuva(c, 30) && c.ventoKmh >= 12 && c.ventoKmh <= 30 && i >= 2.5,
  },
  {
    emoji: '🚶',
    nome: 'Caminhada',
    motivo: 'Sem chuva e temperatura confortável',
    vale: (c, i) => semChuva(c, 40) && c.sensacaoTermica >= 12 && c.sensacaoTermica <= 32 && c.ventoKmh <= 30 && i >= 2,
  },
  {
    emoji: '💧',
    nome: 'Passeio com sombra e água',
    motivo: 'Calor forte: leve água e procure sombra',
    vale: (c, i) => semChuva(c, 40) && c.sensacaoTermica > 30 && i >= 2,
  },
]

export function recomendarAtividades(clima: ClimaAtual, indice: number): Atividade[] {
  return REGRAS.filter((r) => r.vale(clima, indice))
    .slice(0, 5)
    .map(({ emoji, nome, motivo }) => ({ emoji, nome, motivo }))
}
