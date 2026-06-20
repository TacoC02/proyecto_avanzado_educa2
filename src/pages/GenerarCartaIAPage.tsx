import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartas } from '../contexts/CartasContext'
import './GenerarCartaIAPage.css'

const GLOBAL_CONTEXT = 'Temática Pokémon, ataque entre 0 y 100, defensa entre 0 y 50, vida entre 100 y 200. Debe tener un elemento de los siguientes: Agua, Fuego o Tierra.'
const API_URL = 'https://educapi-v2.onrender.com/ai/generate-card'
const USER_SECRET_KEY = 'Cesa369435EZ'

export default function GenerarCartaIAPage() {
  const navigate = useNavigate()
  const { addCarta } = useCartas()
  const [cardPrompt, setCardPrompt] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [generatedName, setGeneratedName] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!cardPrompt.trim()) {
      setErrorMessage('Escribe un prompt para generar la carta.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          usersecretpasskey: USER_SECRET_KEY,
        },
        body: JSON.stringify({
          globalContext: GLOBAL_CONTEXT,
          cardPrompt: cardPrompt.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const message = data?.message || `Error ${response.status}`
        throw new Error(message)
      }

      const generated = {
        nombre: data.name || data.nb_name || 'Carta IA',
        descripcion: data.description || 'Carta creada por IA.',
        ataque: Number(data.attack ?? data.ataque ?? 0),
        defensa: Number(data.defense ?? data.defensa ?? 0),
        vida: Number(data.lifePoints ?? data.llifepoints ?? data.lifePoints ?? 0),
        pictureUrl: data.pictureUrl || data.pictureURL || '',
        attributes: typeof data.attributes === 'string'
          ? data.attributes
          : typeof data.attributes === 'object' && data.attributes !== null
            ? (data.attributes.element || data.attributes.tipo || JSON.stringify(data.attributes))
            : 'Normal',
      }

      await addCarta({
        nb_name: generated.nombre,
        description: generated.descripcion,
        attack: generated.ataque,
        defense: generated.defensa,
        llifepoints: generated.vida,
        pictureUrl: generated.pictureUrl,
        attributes: generated.attributes,
      })

      setGeneratedName(generated.nombre)
      setStatus('success')
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error?.message || 'No se pudo generar la carta. Intenta nuevamente.')
    }
  }

  return (
    <div className="ia-page-container">
      <section className="ia-panel">
        <div className="ia-chat-card">
          <div className="ia-chat-header">
            <span className="ia-badge">IA Pokémon</span>
            <h1>Generar carta</h1>
            <p>Describe la carta que quieres y la IA la creará con nombre, stats, descripción e imagen.</p>
          </div>

          <div className="ia-chat-window">
            <div className="ia-bubble assistant">
              Hola entrenador. Escribe tu prompt y pulsa Generar carta.
            </div>

            <form className="ia-form" onSubmit={handleSubmit}>
              <label htmlFor="cardPrompt">Prompt de la carta</label>
              <textarea
                id="cardPrompt"
                value={cardPrompt}
                onChange={(event) => setCardPrompt(event.target.value)}
                placeholder="Ejemplo: La carta debe representar la fotosíntesis y su color principal debe ser verde."
                rows={6}
              />

              <div className="ia-actions">
                <button type="submit" className="ia-button primary" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Generando carta...' : 'Generar carta'}
                </button>
                <button type="button" className="ia-button secondary" onClick={() => navigate('/card')}>
                  Volver al mazo
                </button>
              </div>
            </form>

            {status === 'error' && (
              <div className="ia-message error">
                <strong>Error:</strong> {errorMessage}
              </div>
            )}

            {status === 'success' && (
              <div className="ia-message success">
                <strong>¡Carta generada!</strong> {generatedName} se guardó en tu colección.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
