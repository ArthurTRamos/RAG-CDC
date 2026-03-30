export default function Header() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
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
          <div className="brand-title">Consulta CDC</div>
          <div className="brand-subtitle">
            Assistente do Código de Defesa do Consumidor
          </div>
        </div>

        <nav className="topbar-nav" aria-label="Links">
          <a className="link" href="http://localhost:8000/docs" target="_blank">
            API
          </a>
        </nav>
      </div>
    </header>
  )
}