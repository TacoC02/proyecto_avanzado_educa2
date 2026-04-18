// VistaMazo.tsx
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
  }, [])

  const toggleSelect = (numero: number) => {
    if (!selectionMode) return
    setSelected(prev => prev.includes(numero) ? prev.filter(n => n !== numero) : [...prev, numero])
  }

  const activateSelectionMode = () => {
    setSelectionMode(true)
    setSelected([])
  }

  const cancelSelection = () => {
    setSelectionMode(false)
    setSelected([])
  }

  const handleDeleteClick = () => {
    if (!selectionMode) {
      activateSelectionMode()
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

  const handleEdit = (numero: number) => {
    navigate(`/card/edit/${numero}`)
  }

  if (initialLoading) {
    return <Spinner message="Cargando tu mazo Pokémon..." />
  }

  return (
    <div className="relative pt-16">
      {selectionMode && selected.length > 0 && (
        <div className="fixed top-20 right-5 bg-gradient-to-r from-red-500 to-red-700 text-yellow-400 px-5 py-3 rounded-full font-bold z-50 shadow-lg border-2 border-yellow-400 backdrop-blur-sm animate-slideInRight">
          🗑️ {selected.length} carta{selected.length !== 1 ? 's' : ''} seleccionada{selected.length !== 1 ? 's' : ''}
        </div>
      )}
      
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-4 z-40">
        <button 
          className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-white to-gray-100 border-2 border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all font-pokemon font-bold tracking-wide"
          onClick={() => navigate('/card/create')}
        >
          ✨ Crear carta
        </button>
        <button
          className={`px-5 py-2.5 rounded-xl bg-gradient-to-b from-white to-red-50 border-2 border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all font-pokemon font-bold tracking-wide ${selectionMode ? 'bg-gradient-to-b from-red-100 to-red-200 animate-pulse' : ''}`}
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
            className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-300 hover:-translate-y-1 transition-all font-pokemon font-bold text-gray-600"
            onClick={cancelSelection}
            disabled={isDeleting}
          >
            ✖ Cancelar
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