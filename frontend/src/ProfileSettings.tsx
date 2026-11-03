import { useEffect, useState } from 'react'
import { api } from './lib/api'
import PrivacyNotice from './PrivacyNotice'

type Perfil = { email: string | null; notificacoesAtivas: boolean }

export default function ProfileSettings() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api<Perfil>('/profile')
      .then(setPerfil)
      .catch((e: Error) => setErro(e.message))
  }, [])

  async function alternar(ativo: boolean) {
    setErro('')
    setAviso('')
    setSalvando(true)
    try {
      setPerfil(
        await api<Perfil>('/profile', {
          method: 'PATCH',
          body: JSON.stringify({ notificacoesAtivas: ativo }),
        }),
      )
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function enviarAgora() {
    setErro('')
    setAviso('')
    setEnviando(true)
    try {
      const r = await api<{ enviadoPara: string }>('/notifications/test', { method: 'POST' })
      setAviso(`Resumo enviado para ${r.enviadoPara}. Se não aparecer, confira o spam.`)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="section" id="preferencias">
      <div className="section-title"><i className="bi bi-bell" /> Notificações</div>
      <div className="card-custom">
        {erro && <div className="alert-erro">{erro}</div>}
        {!perfil && !erro && <div className="empty-state">Carregando…</div>}
        {perfil && (
          <>
            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div>
                <div className="occurrence-text">Receber resumo diário por e-mail</div>
                <div className="occurrence-meta">
                  {perfil.email ? `Enviado para ${perfil.email}` : 'Seu perfil ainda não tem e-mail cadastrado.'}
                </div>
              </div>
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="notif"
                  checked={perfil.notificacoesAtivas}
                  disabled={salvando || !perfil.email}
                  onChange={(e) => alternar(e.target.checked)}
                  aria-label="Receber resumo diário por e-mail"
                />
              </div>
            </div>
            <div className="mt-3">
              <button className="btn-ghost-dark" type="button" onClick={enviarAgora} disabled={enviando || !perfil.email}>
                <i className="bi bi-envelope" /> {enviando ? 'Enviando…' : 'Enviar o resumo agora'}
              </button>
            </div>
            {aviso && <div className="alert-ok">{aviso}</div>}
          </>
        )}
        <hr className="my-3" />
        <PrivacyNotice />
      </div>
    </section>
  )
}
