import { useEffect, useMemo, useRef, useState } from 'react'
import ChatText from './ChatText.jsx'

function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (!raw) return ''
  return String(raw).replace(/\/+$/, '')
}

async function askCdc({ apiBaseUrl, message, signal }) {
  const url = apiBaseUrl ? `${apiBaseUrl}/ask` : '/ask'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    signal,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // ignore
  }

  if (!res.ok) {
    const detail =
      typeof data?.detail === 'string'
        ? data.detail
        : Array.isArray(data?.detail)
          ? data.detail.map((d) => d?.msg).filter(Boolean).join(', ')
          : null
    throw new Error(detail || `Request failed (${res.status})`)
  }

  if (!data || typeof data.answer !== 'string') {
    throw new Error('Unexpected API response: missing "answer"')
  }

  return data.answer
}

const EXAMPLE_QUESTIONS = [
  {
    title: 'Direitos básicos',
    text: 'Quais são os direitos básicos do consumidor segundo o CDC?',
    icon: 'scale',
  },
  {
    title: 'Produto com defeito',
    text: 'Comprei um produto com defeito. Quais são meus direitos e prazos?',
    icon: 'shield',
  },
  {
    title: 'Prazo de troca',
    text: 'Qual o prazo para trocar um produto comprado pela internet?',
    icon: 'book',
  },
]

export default function LandingPage() {
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), [])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [error, setError] = useState('')

  const abortRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (messages.length === 0) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, status])

  async function sendMessage(nextMessage) {
    const trimmed = nextMessage.trim()
    if (!trimmed) return

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setError('')
    setStatus('loading')

    const userMsg = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])

    try {
      const answer = await askCdc({
        apiBaseUrl,
        message: trimmed,
        signal: controller.signal,
      })

      const botMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
      }
      setMessages((prev) => [...prev, botMsg])
      setStatus('idle')
    } catch (e) {
      if (e?.name === 'AbortError') return
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Falha ao consultar a API')
    } finally {
      abortRef.current = null
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    void sendMessage(input)
    setInput('')
  }

  const isEmpty = messages.length === 0

  return (
    <section className="chatbot">
      <div className="chatbot-frame">
        {isEmpty ? (
          <div className="empty">
            <div className="empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3l7 3v2c0 3.5-2.3 6.6-5.7 7.6V19h3.2a1 1 0 010 2H7.5a1 1 0 010-2h3.2v-3.4C7.3 14.6 5 11.5 5 8V6l7-3z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 8h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="empty-title">
              Tire suas dúvidas sobre o Código
              <br />
              de Defesa do Consumidor
            </h1>
            <p className="empty-subtitle muted">
              Faça perguntas sobre seus direitos como consumidor. As respostas
              são baseadas na Lei nº 8.078/90.
            </p>

            <div className="cards" aria-label="Sugestões">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q.title}
                  type="button"
                  className="card-suggestion"
                  disabled={status === 'loading'}
                  onClick={() => void sendMessage(q.text)}
                >
                  <div className="card-head">
                    <span className="card-ic" aria-hidden="true">
                      {q.icon === 'scale' ? '⚖️' : q.icon === 'shield' ? '🛡️' : '📘'}
                    </span>
                    <span className="card-title">{q.title}</span>
                  </div>
                  <div className="card-body muted">{q.text}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chatbot-log" role="log" aria-label="Conversa">
            <ChatText
              role="assistant"
              text="Olá! Faça uma pergunta sobre o CDC e eu responderei com base nos artigos recuperados."
            />
            {messages.map((m) => (
              <ChatText key={m.id} role={m.role} text={m.content} />
            ))}
            {status === 'loading' ? (
              <ChatText role="assistant" text="Pensando…" isPending />
            ) : null}
            <div ref={bottomRef} />
          </div>
        )}

        {error ? (
          <div className="error" role="alert">
            <div className="error-title">Erro</div>
            <div className="error-body">{error}</div>
          </div>
        ) : null}

        <div className="chatbot-composer">
          <form className="composer composer-row" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="message">
              Sua pergunta
            </label>
            <input
              id="message"
              className="composer-input composer-input-pill"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void sendMessage(input)
                  setInput('')
                }
              }}
              placeholder="Faça uma pergunta sobre o CDC..."
              disabled={status === 'loading'}
              autoComplete="off"
            />
            <button
              className="send"
              type="submit"
              disabled={status === 'loading' || !input.trim()}
              aria-label="Enviar"
              title="Enviar"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 11.5l18-8-7.5 18-2.5-7-8-3z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 13.5l10-10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </form>

          {apiBaseUrl ? (
            <div className="composer-hint muted">
              Usando <code>{apiBaseUrl}</code>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}