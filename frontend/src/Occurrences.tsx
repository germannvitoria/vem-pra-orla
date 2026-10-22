import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from './lib/api'

type Occurrence = {
  id: string
  userId: string
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

export default function Occurrences({ userId, onCriada }: { userId: string; onCriada: () => void }) {
  const [lista, setLista] = useState<Occurrence[]>([])
  const [tipo, setTipo] = useState('lixo')
  const [local, setLocal] = useState('')
  const [descricao, setDescricao] = useState('')
  const [impacto, setImpacto] = useState('baixo')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)

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

  function limparForm() {
    setEditandoId(null)
    setTipo('lixo')
    setLocal('')
    setDescricao('')
    setImpacto('baixo')
  }

  function iniciarEdicao(o: Occurrence) {
    setEditandoId(o.id)
    setTipo(o.tipo)
    setLocal(o.local)
    setDescricao(o.descricao ?? '')
    setImpacto(o.impacto)
    setErro('')
    document.getElementById('ocorrencias')?.scrollIntoView({ behavior: 'smooth' })
  }

  async function excluir(o: Occurrence) {
    if (!window.confirm('Excluir esta ocorrência?')) return
    setErro('')
    try {
      await api(`/occurrences/${o.id}`, { method: 'DELETE' })
      if (editandoId === o.id) limparForm()
      await carregar()
      onCriada()
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      if (editandoId) {
        await api(`/occurrences/${editandoId}`, {
          method: 'PATCH',
          body: JSON.stringify({ tipo, local, descricao, impacto }),
        })
      } else {
        await api('/occurrences', {
          method: 'POST',
          body: JSON.stringify({ tipo, local, descricao: descricao || undefined, impacto }),
        })
      }
      limparForm()
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
        <div className="col-lg-6">
          <form className="card-custom" onSubmit={enviar}>
            <div className="card-label">{editandoId ? 'Editando ocorrência' : 'Nova ocorrência'}</div>
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
              <i className="bi bi-send" /> {enviando ? 'Enviando…' : editandoId ? 'Salvar alterações' : 'Registrar'}
            </button>
            {editandoId && (
              <button className="btn-cancelar" type="button" onClick={limparForm}>Cancelar edição</button>
            )}
          </form>
        </div>
        <div className="col-lg-6">
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
                      <span>
                        <span className={`badge-impact badge-${imp.classe}`}>{imp.rotulo}</span>
                        {o.userId === userId && (
                          <span className="occ-actions">
                            <button type="button" title="Editar" onClick={() => iniciarEdicao(o)}><i className="bi bi-pencil" /></button>
                            <button type="button" title="Excluir" onClick={() => excluir(o)}><i className="bi bi-trash3" /></button>
                          </span>
                        )}
                      </span>
                    </div>
                    {o.descricao && <div className="occurrence-meta">{o.descricao}</div>}
                    <div className="occurrence-meta"><i className="bi bi-geo-alt-fill" /> {o.local} · {tempoAtras(o.criadoEm)}</div>
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
