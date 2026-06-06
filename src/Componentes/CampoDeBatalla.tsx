import { useEffect, useState, useRef } from 'react'
import './campoDeBatalla.css'
import type { CartaItem } from '../contexts/CartasContext'

type CampoDeBatallaProps = {
  cardA: CartaItem
  cardB: CartaItem
  backgroundImage?: string
  onExit: () => void
}

function calcularDaño(atacante: CartaItem, defensor: CartaItem) {
  const dañoBase = Math.max((atacante.attack || 0) - (defensor.defense || 0) * 0.35, 1)
  return Math.round(dañoBase + Math.random() * 3)
}

export default function CampoDeBatalla({ cardA, cardB, backgroundImage, onExit }: CampoDeBatallaProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [hpA, setHpA] = useState<number>(cardA.llifepoints ?? 0)
  const [hpB, setHpB] = useState<number>(cardB.llifepoints ?? 0)
  const [battleStarted, setBattleStarted] = useState(false)
  const [winner, setWinner] = useState<CartaItem | null>(null)
  const [turn, setTurn] = useState<'A' | 'B' | null>(null)
  const [attacking, setAttacking] = useState<'A' | 'B' | null>(null)
  const [animating, setAnimating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const battleRef = useRef<HTMLDivElement | null>(null)

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
    setMessage(`¿Qué hará ${cardA.nb_name}?`)
    pushLog(`Turno de ${cardA.nb_name}`)
  }

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(document.fullscreenElement === battleRef.current)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!battleRef.current) return
    try {
      if (!document.fullscreenElement) {
        await battleRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (e) {
      // ignore
    }
  }

  const attacker = turn === 'A' ? cardA : cardB
  const defender = turn === 'A' ? cardB : cardA

  const handleFight = () => {
    if (!battleStarted || !turn || winner) return
    const damage = calcularDaño(attacker, defender)
    setAttacking(turn)
    setAnimating(true)
    setMessage(`${attacker.nb_name} atacó!`)

    // Espera la animación antes de aplicar el daño
    window.setTimeout(() => {
      if (turn === 'A') {
        const nextHp = Math.max(0, hpB - damage)
        setHpB(nextHp)
        pushLog(`${attacker.nb_name} hizo ${damage} de daño a ${defender.nb_name}.`)
        if (nextHp === 0) {
          setWinner(attacker)
          pushLog(`🏆 ${attacker.nb_name} gana la batalla.`)
          setBattleStarted(false)
          setAnimating(false)
          setAttacking(null)
          setMessage(`🏆 ${attacker.nb_name} gana la batalla.`)
          return
        }
      } else {
        const nextHp = Math.max(0, hpA - damage)
        setHpA(nextHp)
        pushLog(`${attacker.nb_name} hizo ${damage} de daño a ${defender.nb_name}.`)
        if (nextHp === 0) {
          setWinner(attacker)
          pushLog(`🏆 ${attacker.nb_name} gana la batalla.`)
          setBattleStarted(false)
          setAnimating(false)
          setAttacking(null)
          setMessage(`🏆 ${attacker.nb_name} gana la batalla.`)
          return
        }
      }

      const nextTurn = turn === 'A' ? 'B' : 'A'
      setTurn(nextTurn)
      setAnimating(false)
      setAttacking(null)
      setMessage(`Ahora es turno de ${nextTurn === 'A' ? cardA.nb_name : cardB.nb_name}.`)
      pushLog(`Ahora es turno de ${nextTurn === 'A' ? cardA.nb_name : cardB.nb_name}.`)
    }, 650)
  }

  const handleRun = () => {
    if (!battleStarted || !turn || winner) return

    const fleeing = turn === 'A' ? cardA : cardB
    const victor = turn === 'A' ? cardB : cardA
    setWinner(victor)
    setBattleStarted(false)
    setTurn(null)
    setAttacking(null)
    setMessage(`${fleeing.nb_name} huyó. ${victor.nb_name} gana por abandono.`)
    pushLog(`${fleeing.nb_name} huyó. ${victor.nb_name} gana por abandono.`)
  }

  const currentTurnName = turn === 'A' ? cardA.nb_name : turn === 'B' ? cardB.nb_name : null
  const maxHpA = Math.max(cardA.llifepoints ?? 1, 1)
  const maxHpB = Math.max(cardB.llifepoints ?? 1, 1)

  return (
    <div ref={battleRef} className={`battle-screen ${isFullscreen ? 'is-full' : ''} ${isFullscreen && battleStarted ? 'fs-battle' : ''}`}>
      <div className="battle-bg" aria-hidden style={{ backgroundImage: `url(${backgroundImage ?? ''})` }} />

      <header className="battle-header">
        <div>
          <h1>Campo de Batalla</h1>
          <p className="battle-subtitle">{winner ? `Victoria de ${winner.nb_name}` : battleStarted ? `Turno de ${currentTurnName}` : 'Presiona comenzar'}</p>
        </div>
        <div className="battle-actions">
          <button className="battle-exit" onClick={onExit}>Volver</button>
          <button className="battle-start" onClick={startBattle} disabled={battleStarted || !!winner}>Comenzar</button>
          <button className="battle-fullscreen" onClick={toggleFullscreen}>{isFullscreen ? 'Salir pantalla' : 'Pantalla completa'}</button>
        </div>
      </header>

      <main className="battle-stage">
        <div className="field-area">
          <div className={`opponent-block ${attacking === 'B' ? 'attacking' : ''}`}>
            <div className="sprite sprite-opponent">
              <img src={cardB.pictureUrl} alt={cardB.nb_name} />
            </div>
            <div className="hp hp-opponent">
              <div className="hp-name">{cardB.nb_name}</div>
              <div className="hp-bar"><div style={{ width: `${Math.max(0, (hpB / maxHpB) * 100)}%` }} /></div>
              <div className="hp-text">{hpB} / {cardB.llifepoints ?? 0}</div>
            </div>
          </div>

          <div className={`player-block ${attacking === 'A' ? 'attacking' : ''}`}>
            <div className="sprite sprite-player">
              <img src={cardA.pictureUrl} alt={cardA.nb_name} />
            </div>
            <div className="hp hp-player">
              <div className="hp-name">{cardA.nb_name}</div>
              <div className="hp-bar"><div style={{ width: `${Math.max(0, (hpA / maxHpA) * 100)}%` }} /></div>
              <div className="hp-text">{hpA} / {cardA.llifepoints ?? 0}</div>
            </div>
          </div>

          {/* panel de acciones ahora se renderiza dentro del diálogo inferior */}
        </div>
      </main>

      <div className="dialog-bottom">
        <div className="dialog-inner">
          <div className="dialog-info">
            <div className="dialog-title">Turno de {currentTurnName ?? cardA.nb_name}</div>
            <div className="dialog-message">{message ?? `¿Qué hará ${currentTurnName ?? cardA.nb_name}?`}</div>
          </div>
          <div className="dialog-content">
            <div className="dialog-log">
              {winner && <div className="battle-winner">Ganador: <strong>{winner.nb_name}</strong></div>}
              {logs.slice(0, 5).map((l, i) => <div key={i} className="log-line">{l}</div>)}
            </div>
            <div className="dialog-actions">
              <div className="battle-panel">
                <div className="battle-prompt small">Opciones</div>
                <div className="battle-buttons">
                  <button className="action-btn attack" onClick={handleFight} disabled={!battleStarted || !!winner || animating}>LUCHAR</button>
                  <button className="action-btn bag" disabled>MOCHILA</button>
                  <button className="action-btn pokemon" disabled>POKÉMON</button>
                  <button className="action-btn run" onClick={handleRun} disabled={!battleStarted || !!winner || animating}>HUIR</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


