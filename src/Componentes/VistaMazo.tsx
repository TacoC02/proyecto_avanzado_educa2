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
    descripcion: 'La chispa eléctrica y el rostro más querido de Pokémon. Con sus mejillas que generan electricidad y un rabo en forma de rayo, puede liberar descargas capaces de derrotar a oponentes mucho más grandes.',
    imagen: 'https://www.nintenderos.com/wp-content/uploads/2022/05/1200px-EP1102_Pikachu_de_Ash.png' 
  },
  {
    numero: 2,
    nombre: 'Charizard',
    tipo: 'Fuego/Volador',
    ataque: 84,
    defensa: 78,
    descripcion: 'El dragón orgulloso. Con sus alas incendiarias y un aliento de fuego que derrite la roca, este Pokémon vuela alto en busca de rivales fuertes. Su llama arde con mayor intensidad tras ganar un combate.',
    imagen: 'https://images.wikidexcdn.net/mwuploads/wikidex/e/e6/latest/20220617191549/EP1204_Charizard_de_Lionel.png'
  },
  {
  numero: 3,
  nombre: 'Wobbuffet',
  tipo: 'Psíquico',
  ataque: 33,
  defensa: 58,
  descripcion: 'El maestro del contraataque. Paciente y táctico, pasa horas inmóvil al acecho para devolver cualquier golpe con el doble de fuerza. Su mirada serena oculta una tenacidad inquebrantable.',
  imagen: 'https://preview.redd.it/opinions-on-jessies-wobbuffet-v0-lmxthhgm0h7c1.jpeg?auto=webp&s=efe9b868528083b5e4d0acfe27bd690425280f2d'
  },

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