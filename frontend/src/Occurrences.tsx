import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from './lib/api'

type Occurrence = {
  id: string
  tipo: string
  local: string
  descricao: string | null
  impacto: 'baixo' | 'medio' | 'alto'
  criadoEm: string
}

const TIPOS: Record<string, { rotulo: string; icone: string }> = {
  lixo: { rotulo: 'Lixo', icone: 'bi-trash3' },
  poluicao_sonora: { rotulo: 'Poluição sonora', icone: 'bi-volume-up' },
  animal: { rotulo: 'Animal', icone: 'bi-bug' },
  seguranca: { rotulo: 'Segurança', icone: 'bi-shield-exclamation' },
  outro: { rotulo: 'Outro', icone: 'bi-three-dots' },
}

const IMPACTOS = {
  baixo: { rotulo: 'Baixo', classe: 'low' },
  medio: { rotulo: 'Médio', classe: 'medium' },
  alto: { rotulo: 'Alto', classe: 'high' },
} as const

function tempoAtras(iso: string): string {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h} h`
  return `há ${Math.round(h / 24)} d`
}

export default function Occurrences({ onCriada }: { onCriada: () => void }) {
  const [lista, setLista] = useState<Occurrence[]>([])
  const [tipo, setTipo] = useState('lixo')
  const [local, setLocal] = useState('')
  const [descricao, setDescricao] = useState('')
  const [impacto, setImpacto] = useState('baixo')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function carregar() {
    try {
      setLista(await api<Occurrence[]>('/occurrences'))
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await api('/occurrences', {
        method: 'POST',
        body: JSON.stringify({ tipo, local, descricao: descricao || undefined, impacto }),
      })
      setLocal('')
      setDescricao('')
      setImpacto('baixo')
      await carregar()
      onCriada()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="section" id="ocorrencias">
      <div className="section-title"><i className="bi bi-exclamation-triangle" /> Ocorrências</div>
      <p className="section-desc">Viu algo na orla? Registre. Ocorrências das últimas 24h entram no cálculo do índice.</p>
      {erro && <div className="alert-erro">{erro}</div>}
      <div className="row g-3">
        <div className="col-lg-5">
          <form className="card-custom" onSubmit={enviar}>
            <div className="card-label">Nova ocorrência</div>
            <div className="mb-3">
              <label className="form-label" htmlFor="tipo">Tipo</label>
              <select id="tipo" className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {Object.entries(TIPOS).map(([v, t]) => <option key={v} value={v}>{t.rotulo}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="local">Local</label>
              <input id="local" className="form-control" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex.: Gasômetro" required minLength={2} maxLength={120} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="descricao">Descrição (opcional)</label>
              <textarea id="descricao" className="form-control" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={500} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="impacto">Impacto</label>
              <select id="impacto" className="form-select" value={impacto} onChange={(e) => setImpacto(e.target.value)}>
                {Object.entries(IMPACTOS).map(([v, i]) => <option key={v} value={v}>{i.rotulo}</option>)}
              </select>
            </div>
            <button className="btn-primary-custom" type="submit" disabled={enviando}>
              <i className="bi bi-send" /> {enviando ? 'Enviando…' : 'Registrar'}
            </button>
          </form>
        </div>
        <div className="col-lg-7">
          <div className="card-custom">
            <div className="card-label">Registradas recentemente</div>
            {lista.length === 0 && <div className="empty-state">Nenhuma ocorrência registrada.</div>}
            {lista.map((o) => {
              const t = TIPOS[o.tipo] ?? TIPOS.outro
              const imp = IMPACTOS[o.impacto]
              return (
                <div className="occurrence-item" key={o.id}>
                  <div className={`occurrence-icon-wrap ${imp.classe}`}><i className={`bi ${t.icone}`} /></div>
                  <div className="occurrence-body">
                    <div className="occurrence-row-top">
                      <span className="occurrence-text">{t.rotulo}</span>
                      <span className={`badge-impact badge-${imp.classe}`}>{imp.rotulo}</span>
                    </div>
                    <div className="occurrence-meta"><i className="bi bi-geo-alt-fill" /> {o.local} · {tempoAtras(o.criadoEm)}</div>
                    {o.descricao && <div className="occurrence-meta">{o.descricao}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
