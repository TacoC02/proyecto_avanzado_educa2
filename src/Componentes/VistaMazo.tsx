import { useState } from 'react'
import Carta from './Cartas'      
import './vistaMazo.css'

const cartasData = [
  {
    numero: 1,
    nombre: 'Pikachu',
    tipo: 'Electrico',
    ataque: 55,
    defensa: 40,
    descripcion: 'Pequeño ratón eléctrico con un gran corazón.',
    imagen: 'https://placehold.co/300x200' // usa placeholder si no tienes assets
  },
  {
    numero: 2,
    nombre: 'Charizard',
    tipo: 'Fuego/Volador',
    ataque: 84,
    defensa: 78,
    descripcion: 'Feroz dragón que lanza fuego por la boca.',
    imagen: 'https://placehold.co/300x200'
  }
]

function Mazo() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <div className="mazo">
      {cartasData.map((c, i) => (
        <Carta
          key={c.numero}
          {...c}
          expanded={selectedIndex === i}
          onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
        />
      ))}
    </div>
  )
}

export default Mazo