import { Injectable, ServiceUnavailableException } from '@nestjs/common';

const URL =
  'https://api.open-meteo.com/v1/forecast' +
  '?latitude=-30.03&longitude=-51.23' +
  '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,weather_code' +
  '&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min' +
  '&timezone=America%2FSao_Paulo&forecast_days=1';

const CACHE_MS = 30 * 60 * 1000; // 30 minutos

export interface WeatherNow {
  temperatura: number;
  sensacaoTermica: number;
  umidade: number;
  chuvaMm: number;
  ventoKmh: number;
  codigoTempo: number;
  probabilidadeChuva: number;
  tempMax: number;
  tempMin: number;
  atualizadoEm: string;
}

@Injectable()
export class WeatherService {
  private cache: { data: WeatherNow; expiraEm: number } | null = null;

  async getCurrent(): Promise<WeatherNow> {
    if (this.cache && this.cache.expiraEm > Date.now()) {
      return this.cache.data;
    }

    const res = await fetch(URL);
    if (!res.ok) {
      throw new ServiceUnavailableException('Serviço de clima indisponível');
    }
    const json = await res.json();

    const data: WeatherNow = {
      temperatura: json.current.temperature_2m,
      sensacaoTermica: json.current.apparent_temperature,
      umidade: json.current.relative_humidity_2m,
      chuvaMm: json.current.precipitation,
      ventoKmh: json.current.wind_speed_10m,
      codigoTempo: json.current.weather_code,
      probabilidadeChuva: json.daily.precipitation_probability_max[0],
      tempMax: json.daily.temperature_2m_max[0],
      tempMin: json.daily.temperature_2m_min[0],
      atualizadoEm: new Date().toISOString(),
    };

    this.cache = { data, expiraEm: Date.now() + CACHE_MS };
    return data;
  }
}