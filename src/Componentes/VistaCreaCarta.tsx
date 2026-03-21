import { useState } from 'react'
import './vistaCreaCarta.css'
import type { CartaItem } from '../contexts/CartasContext'

type FormData = {
  nb_name: string
  attributes: string
  attack: number
  defense: number
  llifepoints: number
  description: string
  pokemonName: string
  pictureUrl: string
}

type Props = {
  onClose: () => void
  onCreate: (data: Omit<CartaItem, 'numero'>) => Promise<any> | void
  nextNumero: number
}

function VistaCreaCarta({ onClose, onCreate, nextNumero }: Props) {
  const [form, setForm] = useState<FormData>({
    nb_name: '',
    attributes: '',
    attack: 0,
    defense: 0,
    llifepoints: 100,
    description: '',
    pokemonName: '',
    pictureUrl: '',
  })
  const [showFlash, setShowFlash] = useState(false)

  function handleChange<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((s) => ({ ...s, [key]: value }))
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!form.nb_name || !form.nb_name.trim()) return alert('Ingrese un nombre para la carta')
    if (!form.pokemonName) return alert('Ingrese el name del Pokémon para buscar la pictureUrl')

    const name = form.pokemonName.trim().toLowerCase()
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`)
      if (!res.ok) return alert('Pokémon no encontrado')
      const data = await res.json()
      const image = data?.sprites?.other?.['official-artwork']?.front_default || data?.sprites?.front_default || ''
      if (!image) return alert('pictureUrl no disponible para ese Pokémon')

      setForm((f) => ({ ...f, pictureUrl: image }))
      setShowFlash(true)
      setTimeout(async () => {
        setShowFlash(false)
        try {
          await onCreate({
            nb_name: form.nb_name,
            attributes: form.attributes,
            attack: form.attack,
            defense: form.defense,
            llifepoints: form.llifepoints,
            description: form.description,
            pictureUrl: image,
          })
          onClose()
        } catch (err) {
          console.error('Error en onCreate:', err)
          alert('No se pudo crear la carta. Intente de nuevo.')
        }
      }, 1000)
    } catch (err) {
      console.error(err)
      alert('Error al buscar el Pokémon')
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="create-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="pokebola modal-pokebola" aria-hidden="true" />
          <div className="modal-card-header">
            <span className="modal-num">#{nextNumero}</span>
          </div>

          <div className="modal-card-body">
            <div className="modal-media">
              {form.pictureUrl ? (
                <div className={showFlash ? 'pokemon-flash' : ''} style={{ display: 'inline-block', position: 'relative' }}>
                  <img src={form.pictureUrl} alt={form.nb_name || 'preview'} />
                </div>
              ) : (
                <div style={{ width: 120, height: 120, borderRadius: 999, background: '#fff', boxShadow: 'inset 0 0 0 6px rgba(0,0,0,0.03)' }} />
              )}
            </div>
          </div>

          <div className="modal-card-footer">
            <h2 className="modal-name">{form.nb_name || 'name'}</h2>
          </div>
        </div>

        <aside className="modal-details" onClick={(e) => e.stopPropagation()}>
          <h1>Crear tu carta</h1>
          <form onSubmit={submit} className="create-form">
            <label>
              name
              <input value={form.nb_name} onChange={(e) => handleChange('nb_name', e.target.value)} />
            </label>

            <label>
              attributes
              <input value={form.attributes} onChange={(e) => handleChange('attributes', e.target.value)} />
            </label>

            <div className="stat-row"><span className="stat-icon">⚔️</span>
              <label>attack
                <input type="number" value={form.attack} onChange={(e) => handleChange('attack', Number(e.target.value || 0))} />
              </label>
            </div>

            <div className="stat-row"><span className="stat-icon">🛡️</span>
              <label>defense
                <input type="number" value={form.defense} onChange={(e) => handleChange('defense', Number(e.target.value || 0))} />
              </label>
            </div>

            <div className="stat-row"><span className="stat-icon">❤</span>
              <label>llifepoints
                <input type="number" value={form.llifepoints} onChange={(e) => handleChange('llifepoints', Number(e.target.value || 0))} />
              </label>
            </div>

            <label>
              name del Pokémon
              <input value={form.pokemonName} onChange={(e) => handleChange('pokemonName', e.target.value)} placeholder="Ej: Pikachu" />
            </label>

            <label>
              Descripción
              <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
            </label>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="close-button" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn primary">Agregar</button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  )
}

export default VistaCreaCarta
