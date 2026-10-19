import { useEffect, useState } from 'react';
import { api } from './lib/api';

interface IndexResponse {
  indice: number;
  classificacao: string;
  fatores: {
    notaClima: number;
    notaOcorrencias: number;
    ocorrenciasConsideradas: number;
  };
  clima: {
    temperatura: number;
    sensacaoTermica: number;
    umidade: number;
    chuvaMm: number;
    ventoKmh: number;
    probabilidadeChuva: number;
    tempMax: number;
    tempMin: number;
    atualizadoEm: string;
  };
}

export default function Dashboard() {
  const [dados, setDados] = useState<IndexResponse | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = async () => {
    setCarregando(true);
    setErro('');
    try {
      setDados(await api<IndexResponse>('/leisure-index'));
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  if (erro) return <p style={{ color: 'crimson' }}>{erro}</p>;
  if (!dados) return <p>Carregando condições...</p>;

  const { indice, classificacao, fatores, clima } = dados;

  return (
    <section>
      <h2>Condições na orla agora</h2>
      <p style={{ fontSize: 48, margin: 0 }}>
        {indice.toFixed(1)}<small>/5</small>
      </p>
      <p><strong>{classificacao}</strong></p>

      <ul>
        <li>Temperatura: {clima.temperatura}°C (sensação {clima.sensacaoTermica}°C)</li>
        <li>Máx/mín de hoje: {clima.tempMax}°C / {clima.tempMin}°C</li>
        <li>Chance de chuva: {clima.probabilidadeChuva}%</li>
        <li>Vento: {clima.ventoKmh} km/h</li>
        <li>Umidade: {clima.umidade}%</li>
      </ul>

      <p>
        <small>
          Nota do clima: {fatores.notaClima} · Nota das ocorrências:{' '}
          {fatores.notaOcorrencias} ({fatores.ocorrenciasConsideradas} nas últimas 24h)
        </small>
      </p>

      <button onClick={carregar} disabled={carregando}>
        {carregando ? 'Atualizando...' : 'Atualizar'}
      </button>
    </section>
  );
}