import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Carta from './Cartas'
import './vistaMazo.css'
import { useCartas } from '../contexts/CartasContext'
import Spinner from './Spinner'

function Mazo() {
  const navigate = useNavigate()
  const { cartas, deleteCartas, refresh } = useCartas()
  const [selectionMode, setSelectionMode] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      await refresh()
      setTimeout(() => {
        setInitialLoading(false)
      }, 500)
    }
    loadData()
  }, [refresh])

  // Función para seleccionar/deseleccionar cartas
  const toggleSelect = (numero: number) => {
    console.log('Toggle select:', numero, 'Selection mode:', selectionMode)
    if (!selectionMode) return
    
    setSelected(prev => {
      if (prev.includes(numero)) {
        console.log('Deseleccionando:', numero)
        return prev.filter(n => n !== numero)
      } else {
        console.log('Seleccionando:', numero)
        return [...prev, numero]
      }
    })
  }

  // Activar modo selección
  const activateSelectionMode = () => {
    console.log('Activando modo selección')
    setSelectionMode(true)
    setSelected([])
  }

  // Cancelar modo selección
  const cancelSelection = () => {
    console.log('Cancelando modo selección')
    setSelectionMode(false)
    setSelected([])
  }

  const handleDeleteClick = () => {
    console.log('Handle delete click - selectionMode:', selectionMode, 'selected:', selected)
    
    if (!selectionMode) {
      activateSelectionMode()
      return
    }

    if (selected.length === 0) {
      cancelSelection()
      return
    }

    // Confirmar borrado
    const confirmDelete = window.confirm(`¿Estás seguro de que quieres eliminar ${selected.length} carta${selected.length !== 1 ? 's' : ''}?`)
    if (!confirmDelete) return

    setIsDeleting(true)

    try {
      deleteCartas(selected)
      cancelSelection()
    } catch (err) {
      console.error('Error deleting cartas', err)
      alert('Error al eliminar las cartas. Intenta de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Función para editar carta
  const handleEdit = (numero: number) => {
    navigate(`/card/edit/${numero}`)
  }

  if (initialLoading) {
    return <Spinner message="Cargando tu mazo Pokémon..." />
  }

  return (
    <div className="mazo-container">
      {/* Contador de selección */}
      {selectionMode && selected.length > 0 && (
        <div className="selection-counter">
          🗑️ {selected.length} carta{selected.length !== 1 ? 's' : ''} seleccionada{selected.length !== 1 ? 's' : ''}
        </div>
      )}
      
      <div className="top-controls">
        <button className="create-card-button" onClick={() => navigate('/card/create')}>
          ✨ Crear carta
        </button>
        <button
          className={`delete-card-button ${selectionMode ? 'active' : ''}`}
          onClick={handleDeleteClick}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <span>🗑️ Eliminando...</span>
          ) : selectionMode ? (
            <span>✅ Confirmar borrar {selected.length > 0 ? `(${selected.length})` : ''}</span>
          ) : (
            <span>🗑️ Borrar carta</span>
          )}
        </button>
        {selectionMode && (
          <button 
            className="cancel-button"
            onClick={cancelSelection}
            disabled={isDeleting}
          >
            ✖ Cancelar
          </button>
        )}
      </div>

      {cartas.length === 0 ? (
        <div className="empty-state">
          <div className="label"> Agrega una carta </div>
        </div>
      ) : (
        <div className="mazo">
          {cartas.map((c) => (
            <Carta
              key={c.numero}
              name={c.nb_name}
              numero={c.numero}
              attributes={c.attributes}
              attack={c.attack}
              defense={c.defense}
              llifepoints={c.llifepoints}
              description={c.description}
              pictureUrl={c.pictureUrl}
              selectable={selectionMode}
              isSelected={selected.includes(c.numero)}
              onSelect={() => toggleSelect(c.numero)}
              onEdit={() => handleEdit(c.numero)}
              onClick={() => {
                if (!selectionMode) {
                  navigate(`/card/${c.numero}`)
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Mazo