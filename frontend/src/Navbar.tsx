import logo from './Logo.jpeg'

type Props = { email?: string; onSair: () => void }

export default function Navbar({ email, onSair }: Props) {
  return (
    <nav className="navbar">
      <div className="container d-flex align-items-center justify-content-between">
        <a className="navbar-brand" href="#">
          <span className="logo-circle">
            <img src={logo} alt="" width={38} height={38} />
          </span>
          Vem Pra Orla
        </a>
        <div className="d-flex align-items-center gap-3">
          <span className="nav-user d-none d-sm-inline">{email}</span>
          <button className="btn-ghost" onClick={onSair}>
            <i className="bi bi-box-arrow-right" /> Sair
          </button>
        </div>
      </div>
    </nav>
  )
}
