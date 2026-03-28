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
  carta: CartaItem
  onClose: () => void
  onUpdate: (data: Partial<Omit<CartaItem, 'numero'>>) => Promise<any> | void
}

function VistaEditarCarta({ carta, onClose, onUpdate }: Props) {
  const [form, setForm] = useState<FormData>({
    nb_name: carta.nb_name,
    attributes: carta.attributes,
    attack: carta.attack,
    defense: carta.defense,
    llifepoints: carta.llifepoints || 0,
    description: carta.description,
    pokemonName: '',
    pictureUrl: carta.pictureUrl,
  })
  const [showFlash, setShowFlash] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  function handleChange<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((s) => ({ ...s, [key]: value }))
  }

  async function searchPokemon() {
    if (!form.pokemonName) return alert('Ingrese el nombre del Pokémon para buscar la imagen')
    
    const name = form.pokemonName.trim().toLowerCase()
    setIsSearching(true)
    
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`)
      if (!res.ok) {
        setIsSearching(false)
        return alert('Pokémon no encontrado')
      }
      const data = await res.json()
      const image = data?.sprites?.other?.['official-artwork']?.front_default || data?.sprites?.front_default || ''
      if (!image) {
        setIsSearching(false)
        return alert('Imagen no disponible para ese Pokémon')
      }

      setForm((f) => ({ ...f, pictureUrl: image, nb_name: form.pokemonName }))
      setShowFlash(true)
      setTimeout(() => {
        setShowFlash(false)
        setIsSearching(false)
      }, 1000)
    } catch (err) {
      console.error(err)
      setIsSearching(false)
      alert('Error al buscar el Pokémon')
    }
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!form.nb_name || !form.nb_name.trim()) return alert('Ingrese un nombre para la carta')
    if (!form.pictureUrl) return alert('Debe tener una imagen para la carta')

    try {
      await onUpdate({
        nb_name: form.nb_name,
        attributes: form.attributes,
        attack: form.attack,
        defense: form.defense,
        llifepoints: form.llifepoints,
        description: form.description,
        pictureUrl: form.pictureUrl,
      })
      onClose()
    } catch (err) {
      console.error('Error en onUpdate:', err)
      alert('No se pudo actualizar la carta. Intente de nuevo.')
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="create-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="pokebola modal-pokebola" aria-hidden="true" />
          <div className="modal-card-header">
            <span className="modal-num">#{carta.numero}</span>
          </div>

          <div className="modal-card-body">
            <div className="modal-media">
              {form.pictureUrl ? (
                <div className={showFlash ? 'pokemon-flash' : ''} style={{ display: 'inline-block', position: 'relative' }}>
                  <img src={form.pictureUrl} alt={form.nb_name || 'preview'} />
                </div>
              ) : (
                <div className="empty-image-placeholder">
                  {isSearching ? (
                    <>
                      <div className="searching-animation">
                        <div className="paw-prints">
                          <span>🐾</span>
                          <span>🐾</span>
                          <span>🐾</span>
                        </div>
                        <div className="searching-text">Buscando Pokémon...</div>
                        <div className="loading-dots">
                          <span>.</span><span>.</span><span>.</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="placeholder-icon">🔍</div>
                      <p>Busca un Pokémon para cambiar la imagen</p>
                      <div className="placeholder-hint">
                        <span>Ej: Pikachu, Charizard, Mewtwo</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-card-footer">
            <h2 className="modal-name">{form.nb_name || 'Nombre de la carta'}</h2>
          </div>
        </div>

        <aside className="modal-details" onClick={(e) => e.stopPropagation()}>
          <h1>✏️ Editar carta Pokémon ✏️</h1>
          <form onSubmit={submit} className="create-form">
            <label>
              Nombre de la carta
              <input 
                value={form.nb_name} 
                onChange={(e) => handleChange('nb_name', e.target.value)} 
                placeholder="Ej: Pikachu Furioso"
              />
            </label>

            <label>
              Atributos
              <input value={form.attributes} onChange={(e) => handleChange('attributes', e.target.value)} placeholder="Ej: Eléctrico, Fuego" />
            </label>

            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-icon">⚔️</span>
                <label>Ataque</label>
                <input type="number" value={form.attack} onChange={(e) => handleChange('attack', Number(e.target.value || 0))} />
              </div>
              <div className="stat-item">
                <span className="stat-icon">🛡️</span>
                <label>Defensa</label>
                <input type="number" value={form.defense} onChange={(e) => handleChange('defense', Number(e.target.value || 0))} />
              </div>
              <div className="stat-item">
                <span className="stat-icon">❤️</span>
                <label>Vida</label>
                <input type="number" value={form.llifepoints} onChange={(e) => handleChange('llifepoints', Number(e.target.value || 0))} />
              </div>
            </div>

            <div className="pokemon-search-section">
              <label>
                Cambiar imagen (buscar Pokémon)
                <div className="search-input-group">
                  <input 
                    value={form.pokemonName} 
                    onChange={(e) => handleChange('pokemonName', e.target.value)} 
                    placeholder="Ej: Pikachu"
                    onKeyPress={(e) => e.key === 'Enter' && searchPokemon()}
                  />
                  <button type="button" className="search-button" onClick={searchPokemon} disabled={isSearching}>
                    {isSearching ? 'Buscando...' : '🔍 Buscar nueva imagen'}
                  </button>
                </div>
              </label>
            </div>

            <label>
              Descripción
              <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Describe los poderes y características de tu carta..." rows={4} />
            </label>

            <div className="form-actions">
              <button type="button" className="close-button" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn primary">
                💾 Guardar cambios
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  )
}

export default VistaEditarCarta