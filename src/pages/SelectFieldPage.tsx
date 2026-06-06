import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

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
      <div className="page-battle p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Selecciona primero dos cartas</h1>
        <p className="mb-6">No hay una selección válida de cartas para comenzar la pelea.</p>
        <button
          className="px-5 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition"
          onClick={() => navigate('/card')}
        >
          Volver al mazo
        </button>
      </div>
    )
  }

  return (
    <div className="page-battle px-6 py-10 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <h1 className="text-4xl font-black mb-4 tracking-tight">Elige tu campo de batalla</h1>
          <p className="text-lg text-slate-200">
            Antes de enviar las cartas a pelear, elige el estadio más épico. Cada campo usa una imagen de <code>src/imagenes</code>.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fields.map((field) => (
            <button
              key={field.id}
              type="button"
              className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-2 text-left shadow-xl shadow-black/40 transition hover:-translate-y-1 hover:border-cyan-400/60"
              onClick={() => navigate('/card/battle', { state: { selectedCards, selectedField: field.src } })}
            >
              <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                <img
                  src={field.src}
                  alt={field.label}
                  className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent px-4 py-3">
                  <span className="text-white text-base font-semibold">{field.label}</span>
                </div>
              </div>
              <div className="mt-3 px-2 pb-2">
                <p className="text-sm text-slate-300">Pulsa para confirmar este campo y comenzar la pelea.</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SelectFieldPage
