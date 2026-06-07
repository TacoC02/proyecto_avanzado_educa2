import { useMemo, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './selectField.css'

type LocationState = {
  selectedCards?: number[]
}

type BattleField = {
  id: number
  src: string
  label: string
}

function SelectFieldPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedCards = (location.state as LocationState)?.selectedCards ?? []

  const fields = useMemo<BattleField[]>(() => {
    return Array.from({ length: 22 }, (_, index) => {
      const id = index + 1
      return {
        id,
        label: `Campo ${id}`,
        src: new URL(`../imagenes/campo_${id}.png`, import.meta.url).href,
      }
    })
  }, [])

  const [hovered, setHovered] = useState<BattleField | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handlePreviewMove = (e: React.MouseEvent) => {
    if (!previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    previewRef.current.style.backgroundPosition = `${x}% ${y}%`
  }

  const handleSelect = (field: BattleField) => {
    setSelectedId(field.id)
    // pequeño retardo para reproducir animación antes de navegar
    setTimeout(() => {
      navigate('/card/battle', { state: { selectedCards, selectedField: field.src } })
    }, 380)
  }

  if (selectedCards.length !== 2) {
    return (
      <div className="select-field-empty">
        <h1>Selecciona primero dos cartas</h1>
        <p>No hay una selección válida de cartas para comenzar la pelea.</p>
        <button className="btn" onClick={() => navigate('/card')}>Volver al mazo</button>
      </div>
    )
  }

  return (
    <div className="select-field-page">
      <div className="select-frame">
        <div
          ref={previewRef}
          className="field-preview"
          onMouseMove={handlePreviewMove}
          style={{ backgroundImage: `url(${hovered?.src ?? fields[0].src})` }}
          aria-hidden
        >
          <div className="pokeballs">
            <span className="pokeball p1" />
            <span className="pokeball p2" />
            <span className="pokeball p3" />
          </div>
        </div>
        <div className="retro-badge">ESTADIO</div>
        <header className="retro-header">
          <div className="pokeball-deco" aria-hidden>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#fff" stroke="#000" strokeWidth="0.8" />
              <path d="M2 12h20" stroke="#d62828" strokeWidth="3" />
              <circle cx="12" cy="12" r="3" fill="#fff" stroke="#000" strokeWidth="0.8" />
            </svg>
          </div>
          <div>
            <h1 className="retro-title">Elige tu campo de batalla</h1>
            <p className="retro-sub">Selecciona el campo donde tus pokemones lucharan</p>
          </div>
        </header>

        <main className="select-content">
          <div className="fields-grid">
            {fields.map((field) => (
              <button
                key={field.id}
                type="button"
                className={`field-card ${selectedId === field.id ? 'selected' : ''}`}
                onMouseEnter={() => setHovered(field)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleSelect(field)}
                aria-pressed={selectedId === field.id}
              >
                <div className="field-thumb">
                  <img src={field.src} alt={field.label} />
                </div>
                <div className="field-meta">
                  <div className="field-label">{field.label}</div>
                  <div className="field-desc">Pulsa para seleccionar este campo</div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default SelectFieldPage
