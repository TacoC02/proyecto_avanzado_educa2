import { useEffect, useState, useRef } from 'react'
import './campoDeBatalla.css'
import type { CartaItem } from '../contexts/CartasContext'

const itemPool = [
  { id: 'potion', name: 'Poción', emoji: '🧪', description: 'Restaura 30 HP al Pokémon activo.', kind: 'heal' as const, value: 30 },
  { id: 'boost', name: 'Energizante', emoji: '⚡', description: 'Aumenta su ataque en +6 por el resto de la batalla.', kind: 'boost' as const, value: 6 },
  { id: 'revive', name: 'Revivir', emoji: '✨', description: 'Sube su vida a 25 HP si está bajo.', kind: 'revive' as const, value: 25 },
  { id: 'shield', name: 'Escudo', emoji: '🛡️', description: 'Reduce el daño recibido en 4 puntos durante el próximo ataque.', kind: 'shield' as const, value: 4 },
]

type CampoDeBatallaProps = {
  cardA: CartaItem
  cardB: CartaItem
  backgroundImage?: string
  onExit: () => void
}

function calcularDaño(atacante: CartaItem, defensor: CartaItem, bonus = 0) {
  const dañoBase = Math.max((atacante.attack || 0) + bonus - (defensor.defense || 0) * 0.35, 1)
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
  const [bagOpen, setBagOpen] = useState(false)
  const [bagItems, setBagItems] = useState(() => itemPool.sort(() => Math.random() - 0.5).slice(0, 4))
  const [attackBoost, setAttackBoost] = useState({ A: 0, B: 0 })
  const [damageReduction, setDamageReduction] = useState({ A: 0, B: 0 })
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
    const bonus = turn === 'A' ? attackBoost.A : attackBoost.B
    const baseDamage = calcularDaño(attacker, defender, bonus)
    const damage = Math.max(1, baseDamage - (damageReduction[turn === 'A' ? 'B' : 'A'] ?? 0))
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

  const handleUseItem = (item: (typeof itemPool)[number]) => {
    if (!battleStarted || !turn || winner) return

    const activeCard = turn === 'A' ? cardA : cardB
    const activeKey = turn === 'A' ? 'A' : 'B' as const

    if (item.kind === 'heal') {
      if (turn === 'A') {
        setHpA((prev) => Math.min(cardA.llifepoints ?? prev, prev + item.value))
      } else {
        setHpB((prev) => Math.min(cardB.llifepoints ?? prev, prev + item.value))
      }
      setMessage(`${activeCard.nb_name} usó ${item.name} y recuperó ${item.value} HP.`)
    }

    if (item.kind === 'boost') {
      setAttackBoost((prev) => ({ ...prev, [activeKey]: prev[activeKey] + item.value }))
      setMessage(`${activeCard.nb_name} activó ${item.name} y su ataque subió +${item.value}.`)
    }

    if (item.kind === 'revive') {
      if (turn === 'A') {
        setHpA((prev) => Math.max(prev, 25))
      } else {
        setHpB((prev) => Math.max(prev, 25))
      }
      setMessage(`${activeCard.nb_name} usó ${item.name} y volvió con energía.`)
    }

    if (item.kind === 'shield') {
      setDamageReduction((prev) => ({ ...prev, [activeKey]: prev[activeKey] + item.value }))
      setMessage(`${activeCard.nb_name} usó ${item.name} y se protegió del siguiente golpe.`)
    }

    setBagOpen(false)
    setBagItems((prev) => prev.filter((entry) => entry.id !== item.id))
    pushLog(`${activeCard.nb_name} usó ${item.name}.`)

    window.setTimeout(() => {
      const nextTurn = turn === 'A' ? 'B' : 'A'
      setTurn(nextTurn)
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
                  <button className="action-btn bag" onClick={() => setBagOpen(true)} disabled={!battleStarted || !!winner || animating}>MOCHILA</button>
                  <button className="action-btn pokemon" disabled>POKÉMON</button>
                  <button className="action-btn run" onClick={handleRun} disabled={!battleStarted || !!winner || animating}>HUIR</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {bagOpen && (
        <div className="item-modal-overlay" onClick={() => setBagOpen(false)}>
          <div className="item-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="item-modal-header">
              <div>
                <p className="item-modal-kicker">Mochila</p>
                <h3>Objetos aleatorios para esta batalla</h3>
              </div>
              <button className="item-close-btn" onClick={() => setBagOpen(false)}>×</button>
            </div>
            <p className="item-modal-copy">Toca un objeto para usarlo. Cada uso consume el turno actual.</p>
            <div className="item-grid">
              {bagItems.length === 0 ? (
                <div className="item-empty">No quedan objetos en la mochila.</div>
              ) : bagItems.map((item) => (
                <button key={item.id} className="item-card" onClick={() => handleUseItem(item)}>
                  <span className="item-icon">{item.emoji}</span>
                  <strong>{item.name}</strong>
                  <span>{item.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


