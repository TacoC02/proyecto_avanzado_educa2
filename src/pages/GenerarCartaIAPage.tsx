import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartas, type CartaItem } from '../contexts/CartasContext'
import Carta from '../Componentes/Cartas'
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

function isPokeApiImageUrl(url: string | undefined) {
  if (!url || typeof url !== 'string') return false
  const normalized = url.toLowerCase()
  const allowedFragments = [
    'raw.githubusercontent.com/pokeapi',
    'pokeapi.co/api/v2/pokemon',
    '/other/official-artwork/',
    '/sprites/pokemon/',
  ]
  return allowedFragments.some((fragment) => normalized.includes(fragment)) || normalized.endsWith('.png')
}

function hasQuotedValue(value: string): boolean {
  return /["']\s*[^"']+\s*["']/.test(value)
}

function isInvalidCandidate(candidate: CandidateCard, existingCards: CartaItem[]) {
  const imageInvalid = Boolean(candidate.pictureUrl) && !isPokeApiImageUrl(candidate.pictureUrl)
  const quotedAttribute = hasQuotedValue(candidate.attributes)
  const quotedName = hasQuotedValue(candidate.nb_name)
  const quotedDescription = hasQuotedValue(candidate.description)
  const similarInvalidExisting = existingCards.some((card) => {
    const similarity = similarityScore(normalizeText(candidate.nb_name), normalizeText(card.nb_name))
    return similarity >= 0.85 && Boolean(card.pictureUrl) && !isPokeApiImageUrl(card.pictureUrl)
  })
  return imageInvalid || quotedAttribute || quotedName || quotedDescription || similarInvalidExisting
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
    type ScoreEntry = { name: string; score: number }
    const scores: ScoreEntry[] = names.map((name: string) => {
      const normalizedName = normalizeText(name)
      const score = similarityScore(normalizedName, word)
      return { name, score }
    })

    const top = scores.sort((a: ScoreEntry, b: ScoreEntry) => b.score - a.score)[0]
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

type CandidateCard = {
  id: string
  nb_name: string
  description: string
  attack: number
  defense: number
  llifepoints: number
  pictureUrl: string
  attributes: string
  source: 'oficial' | 'ia'
}

export default function GenerarCartaIAPage() {
  const navigate = useNavigate()
  const { addCarta, updateCarta, cartas } = useCartas()
  const [cardPrompt, setCardPrompt] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success' | 'pending-selection'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [generatedName, setGeneratedName] = useState('')
  const [candidates, setCandidates] = useState<CandidateCard[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateCard | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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

      const promptPokemonName = candidateName.trim()
      let resolvedPokemonName = ''
      let pictureUrl = ''
      let pokemonTypes: string[] = []
      let attributes = normalizeAttributes(payload?.attributes ?? payload?.types ?? payload?.tipo ?? payload?.type) || 'Normal'

      const tryResolvePokemon = async (query: string) => {
        const pokemonInfo = await fetchPokemonInfo(query)
        pictureUrl = pokemonInfo.imageUrl
        pokemonTypes = pokemonInfo.types
        resolvedPokemonName = pokemonInfo.pokemonName
      }

      const searchQueries = [promptPokemonName, cardPrompt].filter(Boolean)
      for (const query of searchQueries) {
        try {
          await tryResolvePokemon(query)
          break
        } catch {

        }
      }

      if (!resolvedPokemonName) {
        throw new Error('No se encontró un Pokémon real para usar como imagen de la carta.')
      }

      if (!pictureUrl) {
        throw new Error('No se pudo obtener la imagen oficial del Pokémon desde la API de Pokémon.')
      }

      if (pokemonTypes.length > 0) {
        attributes = pokemonTypes.join(', ')
      }

      const rawPicture = payload?.pictureUrl || payload?.imageUrl || payload?.image || ''
      const rawName = payload?.name || payload?.nb_name || payload?.pokemonName || payload?.pokemon || 'Carta IA'
      const rawAttributes = normalizeAttributes(payload?.attributes ?? payload?.types ?? payload?.tipo ?? payload?.type) || 'Normal'

      const officialCandidate: CandidateCard = {
        id: 'oficial',
        nb_name: resolvedPokemonName,
        description,
        attack,
        defense,
        llifepoints: lifePoints,
        pictureUrl,
        attributes,
        source: 'oficial',
      }

      const rawCandidate: CandidateCard = {
        id: 'ia',
        nb_name: toTitleCase(String(rawName)),
        description,
        attack,
        defense,
        llifepoints: lifePoints,
        pictureUrl: rawPicture || pictureUrl,
        attributes: rawAttributes,
        source: 'ia',
      }

      const candidatesToShow = [officialCandidate, rawCandidate].filter(
        (candidate) => !isInvalidCandidate(candidate, cartas),
      )

      if (candidatesToShow.length === 0) {
        throw new Error('No se generó ninguna carta válida. Intenta con otro prompt.')
      }

      setCandidates(candidatesToShow)
      setSelectedCandidate(candidatesToShow[0])
      setStatus('pending-selection')
      return
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error?.message || 'No se pudo generar la carta. Intenta nuevamente.')
    }
  }

  const handleSelectCandidate = async () => {
    if (isSaving || !selectedCandidate) return

    setIsSaving(true)
    setErrorMessage('')
    setStatus('loading')

    try {
      const normalizedResolvedName = normalizeText(selectedCandidate.nb_name)
      const existingCard = cartas.find((card) => {
        const normalizedCardName = normalizeText(card.nb_name)
        const similarity = similarityScore(normalizedCardName, normalizedResolvedName)
        const isExact = normalizedCardName === normalizedResolvedName
        const isPartial = normalizedResolvedName && (normalizedCardName.includes(normalizedResolvedName) || normalizedResolvedName.includes(normalizedCardName))
        return isExact || isPartial || similarity >= 0.75
      })

      await (existingCard
        ? updateCarta(existingCard.numero, selectedCandidate)
        : addCarta(selectedCandidate))

      setGeneratedName(selectedCandidate.nb_name)
      setCandidates([])
      setSelectedCandidate(null)
      setStatus('success')
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error?.message || 'No se pudo guardar la carta seleccionada.')
    } finally {
      setIsSaving(false)
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
                <strong>¡Carta guardada!</strong> {generatedName} se integró a tu colección.
              </div>
            )}
          </div>
        </div>
      </section>

      {status === 'pending-selection' && (
        <div className="ia-modal-overlay">
          <div className="ia-modal">
            <h2>Selecciona la carta que quieres guardar</h2>
            <div className="ia-modal-grid">
              {candidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className={`ia-modal-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                >
                  <Carta
                    numero={index + 1}
                    name={candidate.nb_name}
                    attributes={candidate.attributes}
                    attack={candidate.attack}
                    defense={candidate.defense}
                    llifepoints={candidate.llifepoints}
                    description={candidate.description}
                    pictureUrl={candidate.pictureUrl}
                    selectable={false}
                  />
                  <button
                    type="button"
                    className={`ia-button secondary ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    {selectedCandidate?.id === candidate.id ? 'Seleccionada' : 'Seleccionar'}
                  </button>
                  <div className="ia-card-source">Fuente: {candidate.source === 'oficial' ? 'PokeAPI' : 'IA'}</div>
                </div>
              ))}
            </div>
            <div className="ia-modal-actions">
              <button
                type="button"
                className="ia-button primary"
                onClick={handleSelectCandidate}
                disabled={!selectedCandidate || isSaving}
              >
                Guardar carta seleccionada
              </button>
              <button
                type="button"
                className="ia-button secondary"
                onClick={() => {
                  setStatus('idle')
                  setCandidates([])
                  setSelectedCandidate(null)
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
