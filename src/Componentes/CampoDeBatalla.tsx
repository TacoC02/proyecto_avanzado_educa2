import { useEffect, useRef, useState } from 'react'
import './campoDeBatalla.css'
import type { CartaItem } from '../contexts/CartasContext'

type CampoDeBatallaProps = {
  cardA: CartaItem
  cardB: CartaItem
  onExit: () => void
}

function calcularDaño(atacante: CartaItem, defensor: CartaItem) {
  const dañoBase = Math.max((atacante.attack || 0) - (defensor.defense || 0) * 0.35, 1)
  return Math.round(dañoBase + Math.random() * 3)
}

export default function CampoDeBatalla({ cardA, cardB, onExit }: CampoDeBatallaProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [hpA, setHpA] = useState<number>(cardA.llifepoints ?? 0)
  const [hpB, setHpB] = useState<number>(cardB.llifepoints ?? 0)
  const [inProgress, setInProgress] = useState(false)
  const [winner, setWinner] = useState<CartaItem | null>(null)
  const [attacking, setAttacking] = useState<'A' | 'B' | null>(null)
  const timeouts = useRef<number[]>([])

  useEffect(() => {
    setHpA(cardA.llifepoints ?? 0)
    setHpB(cardB.llifepoints ?? 0)
    setLogs([])
    setWinner(null)
    setInProgress(false)
    return () => {
      timeouts.current.forEach((id) => clearTimeout(id))
      timeouts.current = []
    }
  }, [cardA, cardB])

  const pushLog = (text: string) => setLogs((l) => [text, ...l].slice(0, 20))

  const startBattle = () => {
    if (inProgress) return
    setInProgress(true)
    pushLog(`¡La batalla entre ${cardA.nb_name} y ${cardB.nb_name} comienza!`)

    let currentA = hpA
    let currentB = hpB
    let turno = 1
    let atacante: 'A' | 'B' = 'A'

    const pasos: Array<() => void> = []

    while (currentA > 0 && currentB > 0 && turno <= 10) {
      const source = atacante === 'A' ? cardA : cardB
      const target = atacante === 'A' ? cardB : cardA
      const daño = calcularDaño(source, target)

      pasos.push(() => {
        setAttacking(atacante)
        if (atacante === 'A') {
          currentB = Math.max(0, currentB - daño)
          setHpB(currentB)
        } else {
          currentA = Math.max(0, currentA - daño)
          setHpA(currentA)
        }
        pushLog(`Turno ${turno}: ${source.nb_name} hizo ${daño} de daño`)
      })

      atacante = atacante === 'A' ? 'B' : 'A'
      turno += 1
    }

    pasos.push(() => {
      const ganador = currentA > currentB ? cardA : currentB > currentA ? cardB : (cardA.attack >= cardB.attack ? cardA : cardB)
      setWinner(ganador)
      pushLog(`🏁 Ganador: ${ganador.nb_name}`)
      setAttacking(null)
      setInProgress(false)
    })

    pasos.forEach((fn, i) => {
      const id = window.setTimeout(fn, 700 * (i + 1))
      timeouts.current.push(id)
    })
  }

  return (
    <div className="battle-screen">
      <div className="battle-bg" aria-hidden />

      <header className="battle-header">
        <h1>Campo de Batalla</h1>
        <div className="battle-actions">
          <button className="battle-exit" onClick={onExit}>Volver</button>
          <button className="battle-start" onClick={startBattle} disabled={inProgress}>Iniciar</button>
        </div>
      </header>

      <main className="battle-stage">
        <div className="opponent-area">
          <div className={`sprite ${attacking === 'B' ? 'attacking' : ''}`}>
            <img src={cardB.pictureUrl} alt={cardB.nb_name} />
          </div>
          <div className="hp">
            <div className="hp-name">{cardB.nb_name}</div>
            <div className="hp-bar"><div style={{ width: `${Math.max(0, (hpB / (cardB.llifepoints || 1)) * 100)}%` }} /></div>
            <div className="hp-text">{hpB} / {cardB.llifepoints ?? 0}</div>
          </div>
        </div>

        <div className="field-area" />

        <div className="player-area">
          <div className="hp">
            <div className="hp-name">{cardA.nb_name}</div>
            <div className="hp-bar"><div style={{ width: `${Math.max(0, (hpA / (cardA.llifepoints || 1)) * 100)}%` }} /></div>
            <div className="hp-text">{hpA} / {cardA.llifepoints ?? 0}</div>
          </div>
          <div className={`sprite ${attacking === 'A' ? 'attacking' : ''}`}>
            <img src={cardA.pictureUrl} alt={cardA.nb_name} />
          </div>
        </div>
      </main>

      <aside className="battle-log">
        {winner && <div className="battle-winner">Ganador: <strong>{winner.nb_name}</strong></div>}
        {logs.map((l, i) => <div key={i} className="log-line">{l}</div>)}
      </aside>
    </div>
  )
}


