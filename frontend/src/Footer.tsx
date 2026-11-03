import logo from './logo.png'

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="app-footer-brand">
          <span className="logo-circle"><img src={logo} alt="" width={26} height={26} /></span>
          Vem Pra Orla
        </div>
        <p>Trabalho de Conclusão de Curso · Vitória Generoso Germann</p>
        <p>Instituto Federal do Rio Grande do Sul · Campus Porto Alegre</p>
        <p className="app-footer-small">
          Previsão do tempo: Open-Meteo · O índice de lazer é uma estimativa e não substitui avisos oficiais.
        </p>
      </div>
    </footer>
  )
}
