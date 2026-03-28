import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { CartaItem } from '../contexts/CartasContext'
import { useCartas } from '../contexts/CartasContext'
import VistaEditarCarta from '../Componentes/VistaEditarCarta'
import Spinner from '../Componentes/Spinner'

export default function EditarCartaPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getCartaById, updateCarta } = useCartas()
  const [carta, setCarta] = useState<CartaItem | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cardId = Number(id)
    if (!cardId) {
      navigate('/card', { replace: true })
      return
    }

    setLoading(true)
    setError(null)
    getCartaById(cardId)
      .then((c) => {
        if (!c) {
          navigate('/card', { replace: true })
          return
        }
        setTimeout(() => {
          setCarta(c)
          setLoading(false)
        }, 500)
      })
      .catch((err) => {
        console.error('Error loading carta:', err)
        setError('Error al cargar la carta')
        setTimeout(() => {
          navigate('/card', { replace: true })
        }, 2000)
      })
  }, [getCartaById, id, navigate])

  const handleUpdate = async (data: Partial<Omit<CartaItem, 'numero'>>) => {
    if (!carta) return
    
    const nombreCrudo = data.nb_name || ""
    const nombreFinal = String(nombreCrudo).trim()

    if (!nombreFinal && data.nb_name !== undefined) {
      alert("Error: El nombre de la carta es obligatorio.")
      return
    }

    const updateData = {
      ...data,
      nb_name: nombreFinal || carta.nb_name,
      attack: data.attack !== undefined ? Number(data.attack) : carta.attack,
      defense: data.defense !== undefined ? Number(data.defense) : carta.defense,
      llifepoints: data.llifepoints !== undefined ? Number(data.llifepoints) : carta.llifepoints,
    }

    console.log('Sending update data:', updateData) // Para debug

    try {
      await updateCarta(carta.numero, updateData)
      console.log('Update successful')
      navigate('/card', { replace: true })
    } catch (err: any) {
      console.error('Error al actualizar carta:', err)
      alert(`Error al actualizar la carta: ${err.message || 'Intenta de nuevo.'}`)
    }
  }

  if (loading) {
    return <Spinner message="Cargando carta para editar..." />
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/card')}>Volver al mazo</button>
      </div>
    )
  }

  if (!carta) {
    return null
  }

  return (
    <VistaEditarCarta
      carta={carta}
      onClose={() => navigate('/card', { replace: true })}
      onUpdate={handleUpdate}
    />
  )
}