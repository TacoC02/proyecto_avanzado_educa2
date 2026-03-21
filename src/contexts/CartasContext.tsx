import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const API_BASE = 'https://educapi-v2.onrender.com'
const USER_SECRET_KEY = 'Cesa369435EZ'

export type CartaItem = {
  numero: number
  name: string
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
  addCarta: (data: Omit<CartaItem, 'numero'>) => Promise<void>
  deleteCartas: (numeros: number[]) => Promise<void>
  getCartaById: (id: number) => Promise<CartaItem | undefined>
  refresh: () => Promise<void>
}

const CartasContext = createContext<CartasContextValue | undefined>(undefined)

function mapApiToCarta(item: any): CartaItem {
  return {
    numero: item.idCard,
    name: item.name,
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
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      usersecretpasskey: USER_SECRET_KEY,
      ...(opts.headers ?? {}),
    },
    ...opts,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`)
  }
  return res.json()
}

export function CartasProvider({ children }: { children: React.ReactNode }) {
  const [cartas, setCartas] = useState<CartaItem[]>([])

  async function refresh() {
    const data = await apiFetch('/card')
    const items = Array.isArray(data?.data) ? data.data : []
    setCartas(items.map(mapApiToCarta))
  }

  useEffect(() => {
    refresh().catch((err) => {
      console.error('Error fetching cartas:', err)
    })
  }, [])

  const value = useMemo<CartasContextValue>(() => {
    const getNextNumero = () => {
      return cartas.length ? Math.max(...cartas.map((c) => c.numero)) + 1 : 1
    }

    const addCarta = async (data: Omit<CartaItem, 'numero'>) => {
      const body = {
        name: data.name,
        description: data.description,
        attack: data.attack,
        defense: data.defense,
        lifePoints: data.llifepoints ?? 0,
        pictureUrl: data.pictureUrl,
        attributes: { tipo: data.attributes },
      }

      const result = await apiFetch('/card', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const newCard = mapApiToCarta(result)
      setCartas((prev) => [...prev, newCard])
    }

    const deleteCartas = async (numeros: number[]) => {
      await Promise.all(
        numeros.map((id) =>
          apiFetch(`/card/${id}`, {
            method: 'DELETE',
          })
        )
      )
      setCartas((prev) => prev.filter((c) => !numeros.includes(c.numero)))
    }

    const getCartaById = async (id: number) => {
      try {
        const res = await apiFetch(`/card/${id}`)
        const item = Array.isArray(res?.data) ? res.data[0] : null
        if (!item) return undefined
        return mapApiToCarta(item)
      } catch (err) {
        console.error('Error fetching carta by id', err)
        return undefined
      }
    }

    return { cartas, getNextNumero, addCarta, deleteCartas, getCartaById, refresh }
  }, [cartas])

  return <CartasContext.Provider value={value}>{children}</CartasContext.Provider>
}

export function useCartas() {
  const ctx = useContext(CartasContext)
  if (!ctx) {
    throw new Error('useCartas must be used within a CartasProvider')
  }
  return ctx
}
