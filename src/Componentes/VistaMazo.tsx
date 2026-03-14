import { useState } from 'react'
import { useNavigate } from 'react-router'
import Carta from './Cartas'
import './vistaMazo.css'
import { useCartas } from '../contexts/CartasContext'

function Mazo() {
  const navigate = useNavigate()
  const { cartas, deleteCartas } = useCartas()
  const [selectionMode, setSelectionMode] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  function toggleSelect(numero: number) {
    setSelected((s) => {
      if (s.includes(numero)) return s.filter((n) => n !== numero)
      return [...s, numero]
    })
  }

  async function handleDeleteClick() {
    if (!selectionMode) {
      setSelectionMode(true)
      setSelected([])
      return
    }

    if (selected.length === 0) {
      setSelectionMode(false)
      return
    }

    setIsDeleting(true)
    try {
      await deleteCartas(selected)
      setSelectionMode(false)
      setSelected([])
    } catch (err) {
      console.error('Error deleting cartas', err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mazo-container">
      <div className="top-controls">
        <button className="create-card-button" onClick={() => navigate('/card/create')}>
          Crear carta
        </button>
        <button
          className={"delete-card-button" + (selectionMode ? ' active' : '')}
          onClick={handleDeleteClick}
          disabled={isDeleting}
        >
          {selectionMode ? 'Confirmar borrar' : 'Borrar carta'}
        </button>
      </div>

      {cartas.length === 0 ? (
        <div className="empty-state"><div className="label">Agrega una carta</div></div>
      ) : (
        <div className="mazo">
          {cartas.map((c) => (
            <Carta
              key={c.numero}
              {...c}
              selectable={selectionMode}
              isSelected={selected.includes(c.numero)}
              onSelect={() => toggleSelect(c.numero)}
              onClick={() => {
                if (selectionMode) return
                navigate(`/card/${c.numero}`)
              }}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default Mazo