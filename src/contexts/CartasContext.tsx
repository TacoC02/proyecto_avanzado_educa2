import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const API_BASE = 'https://educapi-v2.onrender.com'

const USER_SECRET_KEY = 'Cesa369435EZ' 

export type CartaItem = {
  numero: number
  nb_name: string
  attributes: string
  attack: number
  defense: number
  description: string
  pictureUrl: string
  llifepoints?: number
  userSecret?: string | null
  createdAt?: string
  updatedAt?: string | null
}

type CartasContextValue = {
  cartas: CartaItem[]
  getNextNumero: () => number
  addCarta: (data: Omit<CartaItem, 'numero'>) => Promise<CartaItem>
  updateCarta: (id: number, data: Partial<Omit<CartaItem, 'numero'>>) => Promise<CartaItem>
  deleteCartas: (numeros: number[]) => Promise<void>
  getCartaById: (id: number) => Promise<CartaItem | undefined>
  refresh: () => Promise<void>
}

const CartasContext = createContext<CartasContextValue | undefined>(undefined)

function mapApiToCarta(item: any): CartaItem {
  return {
    numero: item.idCard,
    nb_name: item.name,  
    description: item.description,
    attack: item.attack,
    defense: item.defense,
    llifepoints: item.lifePoints,
    pictureUrl: item.pictureUrl,
    attributes:
      typeof item.attributes === 'string'
        ? item.attributes
        : item.attributes?.tipo ?? JSON.stringify(item.attributes ?? {}),
    userSecret: item.userSecret,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> | undefined),
  }

  if (USER_SECRET_KEY) {
    headers['usersecretpasskey'] = USER_SECRET_KEY
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`)
  }
  return res.json()
}

export function CartasProvider({ children }: { children: React.ReactNode }) {
  const [cartas, setCartas] = useState<CartaItem[]>([])

  const refresh = useCallback(async () => {
    const data = await apiFetch('/card')
    const items = Array.isArray(data?.data) ? data.data : []
    setCartas(items.map(mapApiToCarta))
  }, [])

  useEffect(() => {
    refresh().catch((err) => {
      console.error('Error fetching cartas:', err)
    })
  }, [refresh])

  const getNextNumero = useCallback(() => {
    if (cartas.length === 0) return 1;
    const maxActual = Math.max(...cartas.map((c) => c.numero));
    return maxActual + 1;
  }, [cartas]);

  const addCarta = useCallback(async (data: Omit<CartaItem, 'numero'>) => {
    const body = {
      name: (data as any).nb_name || (data as any).name || '',
      description: data.description || '',
      attack: Number(data.attack) || 0,
      defense: Number(data.defense) || 0,
      lifePoints: Number((data as any).llifepoints) || 0,
      pictureUrl: data.pictureUrl || '',
      attributes: { tipo: String(data.attributes || '') },
    }

    try {
      const result = await apiFetch('/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const newCard = mapApiToCarta(result)
      setCartas((prev) => [...prev, newCard])
      return newCard
    } catch (err) {
      console.error('addCarta error', err)
      throw err
    }
  }, [])

const updateCarta = useCallback(async (id: number, data: Partial<Omit<CartaItem, 'numero'>>) => {
  const body: any = {}
  
  if (data.nb_name !== undefined) body.name = data.nb_name
  if (data.description !== undefined) body.description = data.description
  if (data.attack !== undefined) body.attack = Number(data.attack)
  if (data.defense !== undefined) body.defense = Number(data.defense)
  if (data.llifepoints !== undefined) body.lifePoints = Number(data.llifepoints)
  if (data.pictureUrl !== undefined) body.pictureUrl = data.pictureUrl
  if (data.attributes !== undefined) body.attributes = { tipo: String(data.attributes) }

  console.log('Updating carta with ID:', id)
  console.log('Request body:', body)

  try {
    try {
      const result = await apiFetch(`/card/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      console.log('PATCH result:', result)
      const updatedCard = mapApiToCarta(result)
      setCartas((prev) => prev.map(c => c.numero === id ? updatedCard : c))
      return updatedCard
    } catch (patchError) {
      console.log('PATCH failed, trying PUT...')
      const result = await apiFetch(`/card/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      console.log('PUT result:', result)
      const updatedCard = mapApiToCarta(result)
      setCartas((prev) => prev.map(c => c.numero === id ? updatedCard : c))
      return updatedCard
    }
  } catch (err) {
    console.error('updateCarta error', err)
    throw err
  }
}, [])

  const deleteCartas = useCallback(async (numeros: number[]) => {
    await Promise.all(
      numeros.map((id) => apiFetch(`/card/${id}`, { method: 'DELETE' }))
    )
    setCartas((prev) => prev.filter((c) => !numeros.includes(c.numero)))
  }, [])

  const getCartaById = useCallback(async (id: number) => {
    try {
      const res = await apiFetch(`/card/${id}`)
      const item = Array.isArray(res?.data) ? res.data[0] : res?.data ?? res
      if (!item) return undefined
      return mapApiToCarta(item)
    } catch (err) {
      console.error('Error al obtener carta por id', err)
      return undefined
    }
  }, [])

  const value = useMemo(
    () => ({ cartas, getNextNumero, addCarta, updateCarta, deleteCartas, getCartaById, refresh }),
    [cartas, getNextNumero, addCarta, updateCarta, deleteCartas, getCartaById, refresh]
  )

  return <CartasContext.Provider value={value}>{children}</CartasContext.Provider>
}

export function useCartas() {
  const ctx = useContext(CartasContext)
  if (!ctx) {
    throw new Error('useCartas must be used within a CartasProvider')
  }
  return ctx
}