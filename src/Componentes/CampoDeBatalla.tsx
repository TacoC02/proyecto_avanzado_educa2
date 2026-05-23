import { useState } from 'react'
import './campoDeBatalla.css'
import type { CartaItem } from '../contexts/CartasContext'

type CampoDeBatallaProps = {
  cardA: CartaItem
  cardB: CartaItem
  onExit: () => void
}

function calcularDaño(atacante: CartaItem, defensor: CartaItem) {
  const dañoBase = Math.max(atacante.attack - defensor.defense * 0.4, 1)
  return Math.round(dañoBase + Math.random() * 4)
}

function CampoDeBatalla({ cardA, cardB, onExit }: CampoDeBatallaProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [winner, setWinner] = useState<CartaItem | null>(null)
  const [finished, setFinished] = useState(false)
  const [rounds, setRounds] = useState(0)

  const startBattle = () => {
    if (finished) return

    let hpA = cardA.llifepoints ?? 0
    let hpB = cardB.llifepoints ?? 0
    let atacante = cardA
    let defensor = cardB
    const nuevoLog: string[] = []
    let turno = 1

    while (hpA > 0 && hpB > 0 && turno <= 10) {
      const daño = calcularDaño(atacante, defensor)
      if (atacante.numero === cardA.numero) {
        hpB = Math.max(0, hpB - daño)
      } else {
        hpA = Math.max(0, hpA - daño)
      }

      nuevoLog.push(
        `Turno ${turno}: ${atacante.nb_name} ataca a ${defensor.nb_name} y hace ${daño} de daño. (${hpA} vs ${hpB})`
      )

      if (hpA === 0 || hpB === 0) break
      ;[atacante, defensor] = [defensor, atacante]
      turno += 1
    }

    const ganador = hpA > hpB ? cardA : hpB > hpA ? cardB : (cardA.attack >= cardB.attack ? cardA : cardB)
    nuevoLog.push(`🏁 Ganador: ${ganador.nb_name}!`)

    setLogs(nuevoLog)
    setWinner(ganador)
    setFinished(true)
    setRounds(turno)
  }

  return (
    <div className="campo-batalla-wrapper">
      <header className="campo-batalla-header">
        <div>
          <h1>Campo de Batalla</h1>
          <p>Estas usando las dos cartas seleccionadas para pelear.</p>
        </div>
        <button className="battle-exit-button" onClick={onExit} type="button">
          Volver al mazo
        </button>
      </header>

      <div className="battle-cards-grid">
        {[cardA, cardB].map((card) => (
          <article key={card.numero} className="battle-card">
            <div className="battle-card-image">
              <img src={card.pictureUrl} alt={card.nb_name} />
            </div>
            <div className="battle-card-info">
              <h2>{card.nb_name}</h2>
              <p className="battle-card-meta">#{card.numero}</p>
              <p>Ataque: {card.attack}</p>
              <p>Defensa: {card.defense}</p>
              <p>Vida: {card.llifepoints}</p>
              <p>Atributo: {card.attributes}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="battle-controls">
        <button className="battle-start-button" onClick={startBattle} disabled={finished} type="button">
          {finished ? 'Batalla completada' : 'Iniciar pelea'}
        </button>
        {winner && (
          <p className="battle-result">Resultado: <strong>{winner.nb_name}</strong> ganó en {rounds} turnos.</p>
        )}
      </div>

      <div className="battle-log">
        {logs.map((line, index) => (
          <p key={`${index}-${line}`}>{line}</p>
        ))}
      </div>
    </div>
  )
}

export default CampoDeBatalla


