import { useEffect, useState } from 'react'
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
  const [battleStarted, setBattleStarted] = useState(false)
  const [winner, setWinner] = useState<CartaItem | null>(null)
  const [turn, setTurn] = useState<'A' | 'B' | null>(null)
  const [attacking, setAttacking] = useState<'A' | 'B' | null>(null)

  useEffect(() => {
    setHpA(cardA.llifepoints ?? 0)
    setHpB(cardB.llifepoints ?? 0)
    setLogs([])
    setWinner(null)
    setBattleStarted(false)
    setTurn(null)
    setAttacking(null)
  }, [cardA, cardB])

  const pushLog = (text: string) => setLogs((current) => [text, ...current].slice(0, 20))

  const startBattle = () => {
    if (battleStarted) return
    setBattleStarted(true)
    setTurn('A')
    pushLog(`¡La batalla entre ${cardA.nb_name} y ${cardB.nb_name} comienza!`)
    pushLog(`Turno de ${cardA.nb_name}`)
  }

  const attacker = turn === 'A' ? cardA : cardB
  const defender = turn === 'A' ? cardB : cardA

  const handleFight = () => {
    if (!battleStarted || !turn || winner) return

    const damage = calcularDaño(attacker, defender)
    setAttacking(turn)

    if (turn === 'A') {
      const nextHp = Math.max(0, hpB - damage)
      setHpB(nextHp)
      pushLog(`${attacker.nb_name} atacó a ${defender.nb_name} e hizo ${damage} de daño.`)
      if (nextHp === 0) {
        setWinner(attacker)
        pushLog(`🏆 ${attacker.nb_name} gana la batalla.`)
        setBattleStarted(false)
        setAttacking(null)
        return
      }
    } else {
      const nextHp = Math.max(0, hpA - damage)
      setHpA(nextHp)
      pushLog(`${attacker.nb_name} atacó a ${defender.nb_name} e hizo ${damage} de daño.`)
      if (nextHp === 0) {
        setWinner(attacker)
        pushLog(`🏆 ${attacker.nb_name} gana la batalla.`)
        setBattleStarted(false)
        setAttacking(null)
        return
      }
    }

    const nextTurn = turn === 'A' ? 'B' : 'A'
    setTurn(nextTurn)
    setAttacking(null)
    pushLog(`Ahora es turno de ${nextTurn === 'A' ? cardA.nb_name : cardB.nb_name}.`)
  }

  const handleRun = () => {
    if (!battleStarted || !turn || winner) return

    const fleeing = turn === 'A' ? cardA : cardB
    const victor = turn === 'A' ? cardB : cardA
    setWinner(victor)
    setBattleStarted(false)
    setTurn(null)
    setAttacking(null)
    pushLog(`${fleeing.nb_name} huyó. ${victor.nb_name} gana por abandono.`)
  }

  const currentTurnName = turn === 'A' ? cardA.nb_name : turn === 'B' ? cardB.nb_name : null
  const maxHpA = Math.max(cardA.llifepoints ?? 1, 1)
  const maxHpB = Math.max(cardB.llifepoints ?? 1, 1)

  return (
    <div className="battle-screen">
      <div className="battle-bg" aria-hidden />

      <header className="battle-header">
        <div>
          <h1>Campo de Batalla</h1>
          <p className="battle-subtitle">{winner ? `Victoria de ${winner.nb_name}` : battleStarted ? `Turno de ${currentTurnName}` : 'Presiona iniciar para comenzar'}</p>
        </div>
        <div className="battle-actions">
          <button className="battle-exit" onClick={onExit}>Volver</button>
          <button className="battle-start" onClick={startBattle} disabled={battleStarted || !!winner}>Comenzar</button>
        </div>
      </header>

      <main className="battle-stage">
        <div className="opponent-area">
          <div className="hp hp-top">
            <div className="hp-name">{cardB.nb_name}</div>
            <div className="hp-bar"><div style={{ width: `${Math.max(0, (hpB / maxHpB) * 100)}%` }} /></div>
            <div className="hp-text">{hpB} / {cardB.llifepoints ?? 0}</div>
          </div>
          <div className={`sprite ${attacking === 'B' ? 'attacking' : ''}`}>
            <img src={cardB.pictureUrl} alt={cardB.nb_name} />
          </div>
        </div>

        <div className="field-area">
          <div className="battle-panel">
            <div className="battle-prompt">¿Qué hará {currentTurnName ?? cardA.nb_name}?</div>
            <div className="battle-buttons">
              <button className="action-btn attack" onClick={handleFight} disabled={!battleStarted || !!winner}>LUCHAR</button>
              <button className="action-btn bag" disabled>MOCHILA</button>
              <button className="action-btn pokemon" disabled>POKÉMON</button>
              <button className="action-btn run" onClick={handleRun} disabled={!battleStarted || !!winner}>HUIR</button>
            </div>
          </div>
        </div>

        <div className="player-area">
          <div className={`sprite ${attacking === 'A' ? 'attacking' : ''}`}>
            <img src={cardA.pictureUrl} alt={cardA.nb_name} />
          </div>
          <div className="hp hp-bottom">
            <div className="hp-name">{cardA.nb_name}</div>
            <div className="hp-bar"><div style={{ width: `${Math.max(0, (hpA / maxHpA) * 100)}%` }} /></div>
            <div className="hp-text">{hpA} / {cardA.llifepoints ?? 0}</div>
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


