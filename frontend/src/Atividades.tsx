import { recomendarAtividades } from './lib/atividades'
import type { ClimaAtual } from './lib/atividades'

export default function Atividades({ clima, indice }: { clima: ClimaAtual; indice: number }) {
  const lista = recomendarAtividades(clima, indice)

  return (
    <section className="section" id="atividades">
      <div className="section-title"><i className="bi bi-bicycle" /> Atividades recomendadas</div>
      <p className="section-desc">Sugestões a partir do clima de agora e do índice de lazer.</p>
      {lista.length === 0 ? (
        <div className="card-custom">
          <div className="empty-state">
            Hoje as condições não estão boas para atividades ao ar livre. Veja a previsão dos próximos dias para planejar a visita.
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {lista.map((a) => (
            <div className="col-6 col-md-4 col-lg" key={a.nome}>
              <div className="activity-pill h-100">
                <div className="activity-emoji">{a.emoji}</div>
                <div className="activity-name">{a.nome}</div>
                <div className="activity-desc">{a.motivo}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="activity-note">Regras simples sobre o clima; não consideram horário, trânsito nem avisos oficiais.</div>
    </section>
  )
}
