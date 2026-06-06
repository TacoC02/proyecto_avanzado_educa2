import { useMemo } from 'react'
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
                className="field-card"
                onClick={() => navigate('/card/battle', { state: { selectedCards, selectedField: field.src } })}
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
