import { useNavigate } from 'react-router'
import VistaCreaCarta from '../Componentes/VistaCreaCarta'
import { useCartas } from '../contexts/CartasContext'

export default function CrearCartaPage() {
  const navigate = useNavigate()
  const { addCarta, getNextNumero } = useCartas()

  return (
    <VistaCreaCarta
      nextNumero={getNextNumero()}
      onClose={() => navigate('/card', { replace: true })}
      onCreate={async (data) => {
        try {
          await addCarta(data)
        } catch (err) {
          console.error('Error creating carta', err)
        }
        navigate('/card', { replace: true })
      }}
    />
  )
}
