import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from './lib/api';

interface Occurrence {
  id: string;
  tipo: string;
  local: string;
  descricao: string | null;
  impacto: string;
  criadoEm: string;
}

const TIPOS = ['lixo', 'poluicao_sonora', 'animal', 'seguranca', 'outro'];
const IMPACTOS = ['baixo', 'medio', 'alto'];

export default function Occurrences() {
  const [lista, setLista] = useState<Occurrence[]>([]);
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [impacto, setImpacto] = useState(IMPACTOS[0]);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregar = async () => {
    try {
      setLista(await api<Occurrence[]>('/occurrences'));
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await api('/occurrences', {
        method: 'POST',
        body: JSON.stringify({
          tipo,
          local,
          descricao: descricao || undefined,
          impacto,
        }),
      });
      setLocal('');
      setDescricao('');
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section>
      <h2>Registrar ocorrência</h2>
      <form onSubmit={enviar} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input
          placeholder="Local (ex: Gasômetro)"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
        />
        <textarea
          placeholder="Descrição (opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <select value={impacto} onChange={(e) => setImpacto(e.target.value)}>
          {IMPACTOS.map((i) => <option key={i}>{i}</option>)}
        </select>
        <button disabled={enviando}>{enviando ? 'Enviando...' : 'Registrar'}</button>
        {erro && <p style={{ color: 'crimson' }}>{erro}</p>}
      </form>

      <h2>Ocorrências recentes</h2>
      {lista.length === 0 && <p>Nenhuma ocorrência registrada ainda.</p>}
      <ul>
        {lista.map((o) => (
          <li key={o.id}>
            <strong>{o.tipo}</strong> em {o.local} (impacto {o.impacto})
            {o.descricao && <> — {o.descricao}</>}
            <br />
            <small>{new Date(o.criadoEm).toLocaleString('pt-BR')}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}