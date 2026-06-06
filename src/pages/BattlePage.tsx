import { useLocation, useNavigate } from 'react-router-dom'
import CampoDeBatalla from '../Componentes/CampoDeBatalla'
import { useCartas } from '../contexts/CartasContext'

type LocationState = {
  selectedCards?: number[]
  selectedField?: string
}

const defaultFieldImage = new URL('../imagenes/campo_1.png', import.meta.url).href

function BattlePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartas } = useCartas()

  const selectedCards = (location.state as LocationState)?.selectedCards ?? []
  const selectedField = (location.state as LocationState)?.selectedField ?? defaultFieldImage
  const battleCards = selectedCards
    .map((id) => cartas.find((c) => c.numero === id))
    .filter((card): card is NonNullable<typeof card> => card !== undefined)

  const hasSelection = selectedCards.length === 2
  const hasLoadedCards = battleCards.length === 2

  if (!hasSelection) {
    return (
      <div className="page-battle p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">No hay cartas para pelear</h1>
        <p className="mb-6">Selecciona dos cartas en el mazo y usa el botón de pelea.</p>
        <button
          className="px-5 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition"
          onClick={() => navigate('/card')}
        >
          Volver al mazo
        </button>
      </div>
    )
  }

  if (!hasLoadedCards) {
    return (
      <div className="page-battle p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Cargando cartas...</h1>
        <p className="mb-6">Espera un momento mientras cargamos tus cartas seleccionadas.</p>
        <button
          className="px-5 py-3 rounded-xl bg-slate-500 text-white font-bold hover:bg-slate-600 transition"
          onClick={() => navigate('/card')}
        >
          Volver al mazo
        </button>
      </div>
    )
  }

  return (
    <div className="page-battle px-6 py-8">
      <CampoDeBatalla
        cardA={battleCards[0]}
        cardB={battleCards[1]}
        backgroundImage={selectedField}
        onExit={() => navigate('/card')}
      />
    </div>
  )
}

export default BattlePage
