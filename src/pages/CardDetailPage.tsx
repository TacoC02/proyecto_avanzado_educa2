import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { CartaItem } from '../contexts/CartasContext'
import { useCartas } from '../contexts/CartasContext'
import Carta from '../Componentes/Cartas'
import Spinner from '../Componentes/Spinner'

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
        // Pequeño delay para que se vea la animación (opcional)
        setTimeout(() => {
          setCarta(c)
          setLoading(false)
        }, 500)
      })
      .catch((err) => {
        console.error('Error loading carta:', err)
        navigate('/card', { replace: true })
      })
      .finally(() => {
        // Aseguramos que si falla rápido, también quite el loading
        // Pero como ya navegamos, no es necesario
      })
  }, [getCartaById, id, navigate])

  if (loading) {
    return <Spinner message="Cargando carta..." />
  }

  if (!carta) {
    return null
  }

  return (
    <div style={{ padding: 20 }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          marginBottom: 16,
          padding: '10px 20px',
          background: 'linear-gradient(180deg, #fff 0%, #f2f4f5 100%)',
          border: '2px solid rgba(0,0,0,0.06)',
          borderRadius: '12px',
          cursor: 'pointer',
          fontFamily: 'Pokemon Solid, sans-serif',
          fontSize: '14px',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        ← Volver
      </button>
      <Carta 
        expanded={true} 
        onClick={() => navigate('/card')} 
        {...carta} 
        name={carta.nb_name} 
      />
    </div>
  )
}