import logo from './Logo.jpeg'

type Props = { onEntrar: () => void }

const BENEFICIOS = [
  { icone: 'bi-cloud-sun', cor: 'bg-teal-light', texto: 'Clima e previsão da Orla do Guaíba atualizados' },
  { icone: 'bi-emoji-sunglasses', cor: 'bg-green-light', texto: 'Índice de lazer de 0 a 5 combinando clima e ocorrências' },
  { icone: 'bi-megaphone', cor: 'bg-amber-light', texto: 'Registre e acompanhe ocorrências reportadas por quem frequenta' },
]

export default function LoginPage({ onEntrar }: Props) {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-main">
          <span className="logo-circle login-logo-circle">
            <img src={logo} alt="" width={64} height={64} />
          </span>
          <div className="login-app-name">Vem Pra Orla</div>
          <h2>Bem-vindo(a)!</h2>
          <p>Entre com a sua conta Google para ver as condições da orla e registrar ocorrências.</p>
          <button className="btn-primary-custom" onClick={onEntrar}>
            <i className="bi bi-google" /> Entrar com Google
          </button>
          <p className="login-foot">Projeto de TCC · IFRS Campus Porto Alegre</p>
        </div>
        <div className="login-side">
          <span className="login-tag"><i className="bi bi-geo-alt-fill" /> Orla do Guaíba · Porto Alegre</span>
          <h1>Descubra se hoje é um bom dia para aproveitar a orla.</h1>
          <ul className="login-features">
            {BENEFICIOS.map((b) => (
              <li key={b.icone}>
                <span className={`metric-icon ${b.cor}`}><i className={`bi ${b.icone}`} /></span>
                {b.texto}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
