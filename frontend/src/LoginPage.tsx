import logo from './Logo.jpeg'

type Props = { onEntrar: () => void }

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
      </div>
    </div>
  )
}