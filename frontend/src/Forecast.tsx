import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { api } from './lib/api'
import { descreverTempo } from './lib/weather'

Chart.register(...registerables)

type Dia = {
  data: string
  tempMax: number
  tempMin: number
  codigoTempo: number
  probabilidadeChuva: number
  chuvaMm: number
  ventoMaxKmh: number
}

function rotuloDia(data: string, indice: number): string {
  if (indice === 0) return 'Hoje'
  return new Date(`${data}T12:00:00`)
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')
}

export default function Forecast() {
  const [dias, setDias] = useState<Dia[]>([])
  const [erro, setErro] = useState('')
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    api<Dia[]>('/weather/forecast')
      .then(setDias)
      .catch((e: Error) => setErro(e.message))
  }, [])

  useEffect(() => {
    if (!canvas.current || dias.length === 0) return
    const rotulos = dias.map((d, i) => rotuloDia(d.data, i))
    const grafico = new Chart(canvas.current, {
      data: {
        labels: rotulos,
        datasets: [
          {
            type: 'bar',
            label: 'Chance de chuva (%)',
            data: dias.map((d) => d.probabilidadeChuva),
            backgroundColor: 'rgba(31,148,152,0.25)',
            borderRadius: 6,
            yAxisID: 'chuva',
          },
          {
            type: 'line',
            label: 'Máxima (°C)',
            data: dias.map((d) => d.tempMax),
            borderColor: '#1f9860',
            backgroundColor: '#1f9860',
            tension: 0.3,
            yAxisID: 'temp',
          },
          {
            type: 'line',
            label: 'Mínima (°C)',
            data: dias.map((d) => d.tempMin),
            borderColor: '#1F9498',
            backgroundColor: '#1F9498',
            tension: 0.3,
            yAxisID: 'temp',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          temp: { position: 'left', title: { display: true, text: '°C' } },
          chuva: { position: 'right', min: 0, max: 100, grid: { drawOnChartArea: false }, title: { display: true, text: '%' } },
        },
      },
    })
    return () => grafico.destroy()
  }, [dias])

  return (
    <section className="section" id="previsao">
      <div className="section-title"><i className="bi bi-calendar-week" /> Próximos dias</div>
      {erro && <div className="alert-erro">Não foi possível carregar a previsão: {erro}</div>}
      {!erro && dias.length === 0 && <div className="empty-state">Carregando previsão…</div>}
      {dias.length > 0 && (
        <>
          <div className="row g-2 g-md-3 mb-3">
            {dias.map((d, i) => {
              const t = descreverTempo(d.codigoTempo)
              return (
                <div className="col" key={d.data}>
                  <div className="forecast-card h-100">
                    <div className="forecast-day">{rotuloDia(d.data, i)}</div>
                    <div className="forecast-icon"><i className={`bi ${t.icone}`} /></div>
                    <div className="forecast-temp">{Math.round(d.tempMax)}° <span className="forecast-min">{Math.round(d.tempMin)}°</span></div>
                    <div className="forecast-desc">{t.texto}</div>
                    <div className="forecast-desc"><i className="bi bi-droplet" /> {d.probabilidadeChuva}%</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="card-custom">
            <div className="card-label"><i className="bi bi-graph-up" />Temperatura e chuva</div>
            <div className="chart-wrap"><canvas ref={canvas} /></div>
          </div>
        </>
      )}
    </section>
  )
}
