import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartas } from '../contexts/CartasContext'
import './GenerarCartaIAPage.css'

const GLOBAL_CONTEXT = [
  'Temática Pokémon.',
  'Piensa como un diseñador de cartas y analiza el prompt antes de decidir.',
  'Usa valores equilibrados como las cartas creadas manualmente: ataque entre 0 y 100, defensa entre 0 y 50, vida entre 100 y 200.',
  'Usa tipos oficiales de Pokémon en español: Acero, Agua, Bicho, Dragón, Eléctrico, Fantasma, Fuego, Hada, Hielo, Lucha, Normal, Planta, Psíquico, Roca, Siniestro, Tierra, Veneno, Volador.',
  'Si el usuario menciona un Pokémon real, identifícalo con la API de Pokémon, incluso si el nombre tiene errores ortográficos. Usa el Pokémon más parecido y no inventes una imagen.',
].join(' ')
const API_URL = 'https://educapi-v2.onrender.com/ai/generate-card'
const USER_SECRET_KEY = 'Cesa369435EZ'
const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon'

const TYPE_LABELS: Record<string, string> = {
  fire: 'Fuego',
  water: 'Agua',
  grass: 'Planta',
  electric: 'Eléctrico',
  bug: 'Bicho',
  dragon: 'Dragón',
  ghost: 'Fantasma',
  ice: 'Hielo',
  fighting: 'Lucha',
  normal: 'Normal',
  poison: 'Veneno',
  ground: 'Tierra',
  rock: 'Roca',
  psychic: 'Psíquico',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
  flying: 'Volador',
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function toTitleCase(value: string) {
  return value
    .split(/[-\s_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function normalizeAttributes(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeAttributes(item))
      .filter(Boolean)
      .join(', ')
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const possible = [record.tipo, record.type, record.types, record.attributes, record.element]
    for (const candidate of possible) {
      const normalized = normalizeAttributes(candidate)
      if (normalized) return normalized
    }
  }

  return ''
}

function levenshteinDistance(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  return matrix[a.length][b.length]
}

function similarityScore(a: string, b: string) {
  if (!a || !b) return 0
  const maxLength = Math.max(a.length, b.length)
  if (maxLength === 0) return 1
  return 1 - levenshteinDistance(a, b) / maxLength
}

async function resolvePokemonName(input: string) {
  const rawName = input?.trim()
  if (!rawName) {
    throw new Error('No se indicó ningún Pokémon para resolver.')
  }

  const normalizedInput = normalizeText(rawName)
  if (!normalizedInput) {
    throw new Error('No se indicó ningún Pokémon para resolver.')
  }

  const listResponse = await fetch(`${POKEMON_API_URL}?limit=1300`)
  if (!listResponse.ok) {
    throw new Error('No fue posible consultar la PokeAPI.')
  }

  const listData = await listResponse.json()
  const names = Array.isArray(listData?.results)
    ? listData.results
      .map((entry: any) => entry?.name)
      .filter(Boolean)
      .map((name: string) => String(name))
    : []

  const exact = names.find((name: string) => normalizeText(name) === normalizedInput)
  if (exact) return exact

  const normalizedWords = normalizedInput.split(' ').filter(Boolean)
  const candidateWords = normalizedWords.length > 0 ? normalizedWords : [normalizedInput]

  let bestMatch: string | null = null
  let bestScore = 0

  for (const word of candidateWords) {
    const scores = names.map((name: string) => {
      const normalizedName = normalizeText(name)
      const score = similarityScore(normalizedName, word)
      return { name, score }
    })

    const top = scores.sort((a, b) => b.score - a.score)[0]
    if (top && top.score > bestScore) {
      bestMatch = top.name
      bestScore = top.score
    }
  }

  if (bestMatch && bestScore >= 0.6) return bestMatch

  const fallback = names.find((name: string) => normalizedInput.includes(normalizeText(name)) || normalizeText(name).includes(normalizedInput))
  return fallback ?? null
}

async function fetchPokemonInfo(pokemonName: string) {
  const resolvedName = await resolvePokemonName(pokemonName)
  if (!resolvedName) {
    throw new Error('No se encontró un Pokémon real parecido al texto ingresado.')
  }

  const response = await fetch(`${POKEMON_API_URL}/${encodeURIComponent(resolvedName)}`)
  if (!response.ok) {
    throw new Error('No se pudo consultar el detalle del Pokémon.')
  }

  const data = await response.json()
  const imageUrl = data?.sprites?.other?.['official-artwork']?.front_default || data?.sprites?.front_default || ''
  const types = Array.isArray(data?.types)
    ? data.types
      .map((entry: any) => entry?.type?.name)
      .filter(Boolean)
      .map((typeName: string) => TYPE_LABELS[typeName] ?? toTitleCase(typeName))
    : []

  return {
    imageUrl,
    types,
    pokemonName: data?.name ? toTitleCase(data.name) : pokemonName,
  }
}

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
          cardPrompt: `Analiza el siguiente prompt y devuelve una carta coherente. Si el usuario menciona un Pokémon, úsalo y no inventes una imagen. Usa solo datos reales y valores equilibrados.\n\n${cardPrompt.trim()}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const message = data?.message || `Error ${response.status}`
        throw new Error(message)
      }

      const payload = data?.card ?? data?.data ?? data
      const candidateName = payload?.pokemonName || payload?.pokemon || payload?.name || payload?.nb_name || ''
      const description = payload?.description || payload?.descripcion || 'Carta creada por IA.'
      const attack = clamp(Number(payload?.attack ?? payload?.ataque ?? 0), 0, 100)
      const defense = clamp(Number(payload?.defense ?? payload?.defensa ?? 0), 0, 50)
      const lifePoints = clamp(Number(payload?.lifePoints ?? payload?.llifepoints ?? payload?.vida ?? 100), 100, 200)

      let pokemonName = candidateName || cardPrompt
      let pictureUrl = ''
      let attributes = normalizeAttributes(payload?.attributes ?? payload?.types ?? payload?.tipo ?? payload?.type) || 'Normal'

      if (pokemonName) {
        try {
          const pokemonInfo = await fetchPokemonInfo(String(pokemonName))
          pictureUrl = pokemonInfo.imageUrl
          attributes = pokemonInfo.types.length > 0 ? pokemonInfo.types.join(', ') : attributes || 'Normal'
          pokemonName = pokemonInfo.pokemonName
        } catch {
          throw new Error('No se encontró un Pokémon real para usar como imagen de la carta.')
        }
      } else {
        throw new Error('La IA debe indicar un Pokémon real para generar la carta.')
      }

      if (!pictureUrl) {
        throw new Error('No se pudo obtener la imagen oficial del Pokémon desde la API de Pokémon.')
      }

      await addCarta({
        nb_name: payload?.name || payload?.nb_name || pokemonName || 'Carta IA',
        description,
        attack,
        defense,
        llifepoints: lifePoints,
        pictureUrl,
        attributes,
      })

      setGeneratedName(pokemonName || payload?.name || payload?.nb_name || 'Carta IA')
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
            <p>Describe la carta que quieres y la IA la diseñará con stats equilibrados, tipos reales y la imagen oficial del Pokémon desde la API de Pokémon.</p>
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
                placeholder="Ejemplo: Quiero una carta de Charizard con un estilo épico y una actitud agresiva."
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
