import { useEffect, useRef, useState } from 'react'
import { api } from './lib/api'

type Mensagem = { papel: 'user' | 'assistant'; texto: string }

const SAUDACAO: Mensagem = {
  papel: 'assistant',
  texto: 'Oi! Sou o assistente do Vem Pra Orla. Posso responder sobre o clima, o índice de lazer e as ocorrências de agora.',
}

const SUGESTOES = ['Como está a orla agora?', 'Vale a pena ir hoje?', 'Tem alguma ocorrência recente?']

export default function Chatbot() {
  const [aberto, setAberto] = useState(false)
  const [mensagens, setMensagens] = useState<Mensagem[]>([SAUDACAO])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const fim = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, enviando, aberto])

  async function enviar(conteudo: string) {
    const mensagem = conteudo.trim()
    if (!mensagem || enviando) return
    setErro('')
    setTexto('')
    // O histórico enviado ao servidor são as falas anteriores (sem a saudação inicial).
    const historico = mensagens.slice(1).slice(-10)
    setMensagens((m) => [...m, { papel: 'user', texto: mensagem }])
    setEnviando(true)
    try {
      const r = await api<{ resposta: string }>('/chatbot', {
        method: 'POST',
        body: JSON.stringify({ mensagem, historico }),
      })
      setMensagens((m) => [...m, { papel: 'assistant', texto: r.resposta }])
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="chatbot-fab">
      <div className={`chatbot-panel ${aberto ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar"><i className="bi bi-water" /></div>
            <div>
              <div className="chatbot-title">Assistente Orla</div>
              <div className="chatbot-status">Responde com os dados de agora</div>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setAberto(false)} title="Fechar" aria-label="Fechar">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="chatbot-messages">
          {mensagens.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.papel === 'user' ? 'user' : 'bot'}`}>{m.texto}</div>
          ))}
          {mensagens.length === 1 && !enviando && (
            <div className="chat-chips">
              {SUGESTOES.map((s) => (
                <button key={s} type="button" onClick={() => enviar(s)}>{s}</button>
              ))}
            </div>
          )}
          {enviando && <div className="chat-bubble bot chat-loading">Digitando…</div>}
          {erro && <div className="chat-erro">{erro}</div>}
          <div ref={fim} />
        </div>

        <form
          className="chatbot-input-wrap"
          onSubmit={(e) => {
            e.preventDefault()
            enviar(texto)
          }}
        >
          <input
            className="chatbot-input"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Pergunte sobre a orla…"
            maxLength={500}
            disabled={enviando}
          />
          <button className="chatbot-send" type="submit" disabled={enviando || !texto.trim()} aria-label="Enviar">
            <i className="bi bi-send-fill" />
          </button>
        </form>
        <div className="chatbot-note">Respostas geradas por IA; podem conter erros. Não informe dados pessoais.</div>
      </div>

      <button className="chatbot-btn" onClick={() => setAberto((a) => !a)} title="Assistente virtual" aria-label="Assistente virtual">
        <i className={`bi ${aberto ? 'bi-x-lg' : 'bi-chat-dots-fill'}`} />
      </button>
    </div>
  )
}
