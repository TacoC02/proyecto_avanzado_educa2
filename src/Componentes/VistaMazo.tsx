import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Carta from './Cartas'
import './vistaMazo.css'
import { useCartas } from '../contexts/CartasContext'
import Spinner from './Spinner'

type SelectionMode = 'delete' | 'select' | null

function Mazo() {
  const navigate = useNavigate()
  const { cartas, deleteCartas, refresh } = useCartas()
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [savedSelection, setSavedSelection] = useState<number[]>([])
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
  }, [])

  const MAX_SELECTION = 2

  const toggleSelect = (numero: number) => {
    if (!selectionMode) return
    setSelected(prev => {
      const isAlreadySelected = prev.includes(numero)
      if (isAlreadySelected) {
        return prev.filter(n => n !== numero)
      }
      if (selectionMode === 'select' && prev.length >= MAX_SELECTION) {
        alert(`Solo puedes seleccionar ${MAX_SELECTION} cartas.`)
        return prev
      }
      return [...prev, numero]
    })
  }

  const activateSelectionMode = (mode: Exclude<SelectionMode, null>) => {
    setSelectionMode(mode)
    setSelected([])
    if (mode === 'select') {
      setSavedSelection([])
    }
  }

  const canBattle = selectionMode === 'select' ? selected.length === MAX_SELECTION : savedSelection.length === MAX_SELECTION

  const handleBattleClick = () => {
    const battleSelection = selectionMode === 'select' ? selected : savedSelection
    if (battleSelection.length !== MAX_SELECTION) {
      alert(`Selecciona exactamente ${MAX_SELECTION} cartas para pelear.`)
      return
    }
    navigate('/card/select-field', { state: { selectedCards: battleSelection } })
  }

  const cancelSelection = () => {
    setSelectionMode(null)
    setSelected([])
  }

  const clearSavedSelection = () => {
    setSavedSelection([])
  }

  const handleDeleteClick = () => {
    if (selectionMode !== 'delete') {
      activateSelectionMode('delete')
      return
    }
    if (selected.length === 0) {
      cancelSelection()
      return
    }
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

  const handleSelectClick = () => {
    if (selectionMode !== 'select') {
      activateSelectionMode('select')
      return
    }
    if (selected.length === 0) {
      cancelSelection()
      return
    }
    setSavedSelection(selected)
    setSelectionMode(null)
    setSelected([])
  }

  const handleEdit = (numero: number) => {
    navigate(`/card/edit/${numero}`)
  }

  if (initialLoading) {
    return <Spinner message="Cargando tu mazo Pokémon..." />
  }

  return (
    <div className="relative pt-16">
      {selectionMode && selected.length > 0 && (
        <div className="fixed top-20 right-5 bg-gradient-to-r from-violet-500 to-blue-700 text-white px-5 py-3 rounded-full font-bold z-50 shadow-lg border-2 border-cyan-300 backdrop-blur-sm animate-slideInRight">
          {selectionMode === 'delete' ? '🗑️' : '🎯'} {selected.length} carta{selected.length !== 1 ? 's' : ''} {selectionMode === 'delete' ? 'lista para borrar' : 'seleccionada'}
        </div>
      )}
      {selectionMode === null && savedSelection.length > 0 && (
        <div className="fixed top-20 right-5 bg-gradient-to-r from-emerald-500 to-teal-700 text-white px-5 py-3 rounded-full font-bold z-50 shadow-lg border-2 border-lime-300 backdrop-blur-sm animate-slideInRight">
          🎯 {savedSelection.length} carta{savedSelection.length !== 1 ? 's' : ''} lista{savedSelection.length !== 1 ? 's' : ''}
        </div>
      )}
      
      <div className="top-controls">
        <button className="pokedex-button create-card-button" onClick={() => navigate('/card/create')}>
          ✨ Crear carta
        </button>
        <button className="pokedex-button ai-card-button" onClick={() => navigate('/generar-carta-ia')}>
          🤖 Generar IA
        </button>
        <button
          className={`pokedex-button delete-card-button ${selectionMode === 'delete' ? 'active' : ''}`}
          onClick={handleDeleteClick}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <span>🗑️ Eliminando...</span>
          ) : selectionMode === 'delete' ? (
            <span>✅ Confirmar borrar {selected.length > 0 ? `(${selected.length})` : ''}</span>
          ) : (
            <span>🗑️ Borrar carta</span>
          )}
        </button>
        <button
          className={`pokedex-button select-card-button ${selectionMode === 'select' ? 'active' : ''}`}
          onClick={handleSelectClick}
          disabled={isDeleting}
        >
          {selectionMode === 'select' ? (
            <span>✅ Confirmar selección {selected.length > 0 ? `(${selected.length})` : ''}</span>
          ) : (
            <span>🎯 Seleccionar carta</span>
          )}
        </button>
        {(selectionMode === 'select' || (selectionMode === null && savedSelection.length === 2)) && (
          <button
            className={`pokedex-button battle-button ${canBattle ? '' : 'disabled'}`}
            onClick={handleBattleClick}
            disabled={!canBattle || isDeleting}
          >
            <span>⚔️ Pelear</span>
          </button>
        )}
        {selectionMode && (
          <button
            className="pokedex-button cancel-button"
            onClick={cancelSelection}
            disabled={isDeleting}
          >
            ✖ Cancelar
          </button>
        )}
        {savedSelection.length > 0 && selectionMode === null && (
          <button className="pokedex-button clear-selection-button" onClick={clearSavedSelection}>
            ✨ Limpiar selección
          </button>
        )}
      </div>

      {cartas.length === 0 ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-10 animate-fadeInEmpty">
          <div className="font-pokemon font-black text-5xl text-center bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent shadow-lg animate-bounceEmpty relative whitespace-nowrap px-6 py-5 rounded-full">
            <span className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 text-4xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse">◓⃙</span>
            Agrega una carta
            <span className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 text-4xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse delay-150">◓⃙</span>
          </div>
          <div className="text-center font-pokemon text-lg mt-8 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent tracking-wide relative px-6 py-3 bg-black/30 backdrop-blur-md rounded-full border-2 border-yellow-400/30 animate-fadeInUp">
            <span className="inline-block animate-spinStar mr-2">✨</span>
            Busca tu Pokémon favorito y comienza tu colección
            <span className="inline-block animate-spinStar ml-2 animate-spinStarReverse">✨</span>
          </div>
          <div className="absolute bottom-[15%] left-[20%] text-5xl opacity-15 animate-floatPokemon pointer-events-none">🐾</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5 justify-center items-start p-6 mt-6 max-w-[1192px] mx-auto animate-fadeInMazo">
          {cartas.map((c) => {
            const persistSelected = savedSelection.includes(c.numero)
            const activeSelected = selected.includes(c.numero)
            const isSelectedCard = activeSelected || persistSelected
            return (
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
                selectable={selectionMode !== null}
                selectionType={selectionMode ?? (persistSelected ? 'select' : undefined)}
                isSelected={isSelectedCard}
                onSelect={() => toggleSelect(c.numero)}
                onEdit={() => handleEdit(c.numero)}
                onClick={() => {
                  if (!selectionMode) {
                    navigate(`/card/${c.numero}`)
                  }
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Mazo