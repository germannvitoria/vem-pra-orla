import { useEffect, useState } from 'react'
import { api } from './lib/api'
import { descreverTempo } from './lib/weather'
import Atividades from './Atividades'

type Clima = {
  temperatura: number
  sensacaoTermica: number
  umidade: number
  chuvaMm: number
  ventoKmh: number
  codigoTempo: number
  probabilidadeChuva: number
  tempMax: number
  tempMin: number
  atualizadoEm: string
}

type Indice = {
  indice: number
  classificacao: string
  fatores: { notaClima: number; notaOcorrencias: number; ocorrenciasConsideradas: number }
  clima: Clima
}

type Nivel = 'ok' | 'warn' | 'bad' | 'info'

type Ocorrencia = { tipo: string; local: string; impacto: 'baixo' | 'medio' | 'alto'; criadoEm: string }
type Fator = { nivel: Nivel; icone: string; titulo: string; detalhe: string }

const ROTULO_TIPO: Record<string, string> = {
  lixo: 'Lixo',
  poluicao_sonora: 'Poluição sonora',
  animal: 'Animal',
  seguranca: 'Segurança',
  outro: 'Outro',
}

function nivelDoIndice(i: number): 'ok' | 'warn' | 'bad' {
  if (i >= 3) return 'ok'
  if (i >= 2) return 'warn'
  return 'bad'
}

function montarFatores(c: Clima, recentes: Ocorrencia[]): Fator[] {
  const fatores: Fator[] = []

  // Temperatura (usa a sensação térmica, como o cálculo do índice)
  const s = c.sensacaoTermica
  if (s < 10 || s > 36)
    fatores.push({ nivel: 'bad', icone: 'bi-thermometer-half', titulo: 'Temperatura extrema', detalhe: `sensação de ${Math.round(s)}°C, desconfortável para ficar ao ar livre` })
  else if (s < 18 || s > 30)
    fatores.push({ nivel: 'warn', icone: 'bi-thermometer-half', titulo: 'Temperatura fora da faixa ideal', detalhe: `sensação de ${Math.round(s)}°C` })
  else
    fatores.push({ nivel: 'ok', icone: 'bi-thermometer-half', titulo: 'Temperatura agradável', detalhe: `${Math.round(c.temperatura)}°C, ideal para atividades ao ar livre` })

  // Vento
  const v = Math.round(c.ventoKmh)
  if (c.ventoKmh > 40)
    fatores.push({ nivel: 'bad', icone: 'bi-wind', titulo: 'Vento forte', detalhe: `${v} km/h, pode atrapalhar as atividades` })
  else if (c.ventoKmh > 25)
    fatores.push({ nivel: 'warn', icone: 'bi-wind', titulo: 'Vento moderado a forte', detalhe: `${v} km/h` })
  else if (c.ventoKmh >= 10)
    fatores.push({ nivel: 'ok', icone: 'bi-wind', titulo: 'Vento moderado', detalhe: `${v} km/h, sem impacto significativo` })
  else
    fatores.push({ nivel: 'ok', icone: 'bi-wind', titulo: 'Vento fraco', detalhe: `${v} km/h, agradável` })

  // Céu
  const tempo = descreverTempo(c.codigoTempo)
  const nivelCeu: Nivel = c.codigoTempo >= 95 ? 'bad' : c.codigoTempo >= 51 ? 'warn' : 'info'
  fatores.push({ nivel: nivelCeu, icone: tempo.icone, titulo: tempo.texto, detalhe: c.codigoTempo <= 2 ? 'boa cobertura solar' : 'condição atual do céu' })

  // Chuva
  if (c.chuvaMm >= 0.5)
    fatores.push({ nivel: 'bad', icone: 'bi-cloud-rain', titulo: 'Chovendo agora', detalhe: `${c.chuvaMm} mm na última hora` })
  else if (c.probabilidadeChuva >= 70)
    fatores.push({ nivel: 'bad', icone: 'bi-cloud-rain', titulo: 'Alta chance de chuva', detalhe: `${c.probabilidadeChuva}% de probabilidade` })
  else if (c.probabilidadeChuva >= 40)
    fatores.push({ nivel: 'warn', icone: 'bi-cloud-rain', titulo: 'Chance de chuva', detalhe: `${c.probabilidadeChuva}% de probabilidade` })
  else
    fatores.push({ nivel: 'ok', icone: 'bi-droplet', titulo: 'Sem previsão de chuva', detalhe: `apenas ${c.probabilidadeChuva}% de probabilidade` })

  // Ocorrências
  if (recentes.length === 0) {
    fatores.push({ nivel: 'ok', icone: 'bi-shield-check', titulo: 'Nenhuma ocorrência recente', detalhe: 'sem registros nas últimas 24h' })
  } else {
    const ultima = recentes[0]
    const tipo = ROTULO_TIPO[ultima.tipo] ?? 'Ocorrência'
    const grave = recentes.some((o) => o.impacto === 'alto')
    fatores.push({
      nivel: grave ? 'bad' : 'warn',
      icone: 'bi-exclamation-triangle',
      titulo: `${recentes.length} ${recentes.length === 1 ? 'ocorrência recente' : 'ocorrências recentes'}`,
      detalhe: `mais recente: ${tipo} em ${ultima.local}`,
    })
  }
  return fatores
}

function nota(n: number): string {
  return n.toFixed(1).replace('.', ',')
}

export default function Dashboard({ recarregar }: { recarregar: number }) {
  const [dados, setDados] = useState<Indice | null>(null)
  const [recentes, setRecentes] = useState<Ocorrencia[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    api<Indice>('/leisure-index')
      .then((d) => { setDados(d); setErro('') })
      .catch((e: Error) => setErro(e.message))
    api<Ocorrencia[]>('/occurrences')
      .then((lista) => {
        const limite = Date.now() - 24 * 60 * 60 * 1000
        setRecentes(lista.filter((o) => new Date(o.criadoEm).getTime() >= limite))
      })
      .catch(() => setRecentes([]))
  }, [recarregar])

  if (erro) return <div className="alert-erro">Não foi possível carregar o índice: {erro}</div>
  if (!dados) return <div className="empty-state">Carregando condições da orla…</div>

  const { clima, fatores } = dados
  const tempo = descreverTempo(clima.codigoTempo)
  const nivel = nivelDoIndice(dados.indice)
  const classeNivel = nivel === 'ok' ? '' : nivel
  const hora = new Date(clima.atualizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <section className="section" id="clima">
        <div className="section-title"><i className="bi bi-cloud-sun" /> Clima agora</div>
        <div className="row g-3">
          <div className="col-lg-5">
            <div className="weather-main h-100">
              <div className="weather-top">
                <span><i className="bi bi-geo-alt-fill" /> Orla do Guaíba, Porto Alegre</span>
                <span>Atualizado às {hora}</span>
              </div>
              <div className="weather-center">
                <div>
                  <div className="weather-temp">{Math.round(clima.temperatura)}°C</div>
                  <div className="weather-desc">{tempo.texto}</div>
                </div>
                <i className={`bi ${tempo.icone} weather-center-icon`} />
              </div>
              <div className="weather-stats">
                <div className="weather-stat"><strong>{Math.round(clima.sensacaoTermica)}°C</strong><span>Sensação</span></div>
                <div className="weather-stat"><strong>{Math.round(clima.tempMax)}°C</strong><span>Máxima</span></div>
                <div className="weather-stat"><strong>{Math.round(clima.tempMin)}°C</strong><span>Mínima</span></div>
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="row g-3">
              <Metrica icone="bi-droplet-half" cor="bg-teal-light" valor={`${clima.umidade}%`} rotulo="Umidade" />
              <Metrica icone="bi-wind" cor="bg-green-light" valor={`${Math.round(clima.ventoKmh)} km/h`} rotulo="Vento" />
              <Metrica icone="bi-cloud-rain" cor="bg-green2-light" valor={`${clima.probabilidadeChuva}%`} rotulo="Prob. de chuva" />
              <Metrica icone="bi-moisture" cor="bg-amber-light" valor={`${clima.chuvaMm} mm`} rotulo="Chuva agora" />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="lazer">
        <div className="section-title"><i className="bi bi-emoji-sunglasses" />Condições de Lazer da Orla</div>
        <div className="row g-3">
          <div className="col-md-5">
            <div className="card-custom leisure-card">
              <div className="card-label">Índice de lazer</div>
              <div className="leisure-score-wrap">
                <div className={`leisure-score ${classeNivel}`}>{nota(dados.indice)}<small>/5</small></div>
                <span className={`badge-classe ${classeNivel}`}>{dados.classificacao}</span>
                <div className="progress-leisure">
                  <div className={`progress-leisure-fill ${classeNivel}`} style={{ width: `${(dados.indice / 5) * 100}%` }} />
                </div>
              </div>
              <div className="leisure-note">Baseado em clima e ocorrências</div>
            </div>
          </div>
          <div className="col-md-7">
            <div className="card-custom">
              <div className="card-label">Fatores analisados</div>
              {montarFatores(clima, recentes).map((f) => (
                <div key={f.titulo} className={`factor-badge ${f.nivel === 'ok' ? '' : f.nivel}`}>
                  <i className={`bi ${f.icone}`} />
                  <span><strong>{f.titulo}</strong> — {f.detalhe}</span>
                </div>
              ))}
              <div className="factor-notas">
                Nota do clima: {nota(fatores.notaClima)}/5 (peso 60%) · Nota das ocorrências: {nota(fatores.notaOcorrencias)}/5 (peso 40%)
              </div>
            </div>
          </div>
        </div>
      </section>
            <Atividades clima={clima} indice={dados.indice} />
    </>
  )
}

function Metrica({ icone, cor, valor, rotulo }: { icone: string; cor: string; valor: string; rotulo: string }) {
  return (
    <div className="col-6">
      <div className="metric-card">
        <div className={`metric-icon ${cor}`}><i className={`bi ${icone}`} /></div>
        <div className="metric-value">{valor}</div>
        <div className="metric-label">{rotulo}</div>
      </div>
    </div>
  )
}
