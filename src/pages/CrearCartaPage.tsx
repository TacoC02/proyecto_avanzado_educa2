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
      onCreate={async (data: any) => {
        const nombreCrudo = data.nb_name || Object.values(data)[0] || "";
        const nombreFinal = String(nombreCrudo).trim();

        if (!nombreFinal) {
          alert("Error: El nombre de la carta es obligatorio.");
          return;
        }

        try {
          await addCarta({
            ...data,
            nb_name: nombreFinal,
            attack: Number(data.attack) || 0,
            defense: Number(data.defense) || 0,
            numero: getNextNumero()
          });
          
          navigate('/card', { replace: true });
        } catch (err) {
          console.error('Error al crear carta en el servidor:', err);
        }
      }}
    />
  )
}