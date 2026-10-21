// Traduz o código de tempo da WMO (usado pela Open-Meteo) para texto e ícone.
export function descreverTempo(codigo: number): { texto: string; icone: string } {
  if (codigo === 0) return { texto: 'Céu limpo', icone: 'bi-sun' }
  if (codigo <= 2) return { texto: 'Parcialmente nublado', icone: 'bi-cloud-sun' }
  if (codigo === 3) return { texto: 'Nublado', icone: 'bi-cloud' }
  if (codigo <= 48) return { texto: 'Neblina', icone: 'bi-cloud-fog2' }
  if (codigo <= 57) return { texto: 'Garoa', icone: 'bi-cloud-drizzle' }
  if (codigo <= 67) return { texto: 'Chuva', icone: 'bi-cloud-rain-heavy' }
  if (codigo <= 77) return { texto: 'Neve', icone: 'bi-snow' }
  if (codigo <= 82) return { texto: 'Pancadas de chuva', icone: 'bi-cloud-rain' }
  if (codigo <= 86) return { texto: 'Neve', icone: 'bi-snow' }
  return { texto: 'Tempestade', icone: 'bi-cloud-lightning-rain' }
}
