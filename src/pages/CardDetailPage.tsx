import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { CartaItem } from '../contexts/CartasContext'
import { useCartas } from '../contexts/CartasContext'
import Carta from '../Componentes/Cartas'

export default function CardDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getCartaById } = useCartas()
  const [carta, setCarta] = useState<CartaItem | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cardId = Number(id)
    if (!cardId) {
      navigate('/card', { replace: true })
      return
    }

    setLoading(true)
    getCartaById(cardId)
      .then((c) => {
        if (!c) {
          navigate('/card', { replace: true })
          return
        }
        setCarta(c)
      })
      .catch((err) => {
        console.error('Error loading carta:', err)
        navigate('/card', { replace: true })
      })
      .finally(() => setLoading(false))
  }, [getCartaById, id, navigate])

  if (loading) {
    return <div style={{ padding: 20 }}>Cargando...</div>
  }

  if (!carta) {
    return null
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Volver
      </button>
      <Carta 
  expanded={true} 
  onClick={() => navigate('/card')} 
  {...carta} 
  // Agregamos esta línea para que TypeScript no de error:
  name={carta.nb_name} 
/>
    </div>
  )
}
