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
        // 1. Extraemos el nombre y aseguramos que sea un String
        // Si data.nb_name no existe, intentamos con el primer valor, y si no, cadena vacía
        const nombreCrudo = data.nb_name || Object.values(data)[0] || "";
        const nombreFinal = String(nombreCrudo).trim();

        // 2. Validación manual
        if (!nombreFinal) {
          alert("Error: El nombre de la carta es obligatorio.");
          return;
        }

        try {
          // 3. Enviamos el objeto asegurando que nb_name sea string
          await addCarta({
            ...data,
            nb_name: nombreFinal,
            // Forzamos también que los números sean números por si acaso
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