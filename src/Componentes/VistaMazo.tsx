import { useState } from 'react'
import Carta from './Cartas'
import VistaCreaCarta from './VistaCreaCarta'
import './vistaMazo.css'

type CartaItem = {
  numero: number
  name: string
  attributes: string
  attack: number
  defense: number
  description: string
  pictureUrl: string
  llifepoints?: number
}

const initialCartas: CartaItem[] = [
  {
    numero: 1,
    name: 'Pikachu',
    attributes: 'Electrico',
    attack: 55,
    defense: 40,
    description: 'La chispa eléctrica y el rostro más querido de Pokémon. Con sus mejillas que generan electricidad y un rabo en forma de rayo, puede liberar descargas capaces de derrotar a oponentes mucho más grandes.',
    pictureUrl: 'https://www.nintenderos.com/wp-content/uploads/2022/05/1200px-EP1102_Pikachu_de_Ash.png',
  },
  {
    numero: 2,
    name: 'Charizard',
    attributes: 'Fuego/Volador',
    attack: 84,
    defense: 78,
    description: 'El dragón orgulloso. Con sus alas incendiarias y un aliento de fuego que derrite la roca, este Pokémon vuela alto en busca de rivales fuertes. Su llama arde con mayor intensidad tras ganar un combate.',
    pictureUrl: 'https://images.wikidexcdn.net/mwuploads/wikidex/e/e6/latest/20220617191549/EP1204_Charizard_de_Lionel.png',
  },
  {
    numero: 3,
    name: 'Wobbuffet',
    attributes: 'Psíquico',
    attack: 33,
    defense: 58,
    description: 'El maestro del contraattack. Paciente y táctico, pasa horas inmóvil al acecho para devolver cualquier golpe con el doble de fuerza. Su mirada serena oculta una tenacidad inquebrantable.',
    pictureUrl: 'https://preview.redd.it/opinions-on-jessies-wobbuffet-v0-lmxthhgm0h7c1.jpeg?auto=webp&s=efe9b868528083b5e4d0acfe27bd690425280f2d',
  },
]

function Mazo() {
  const [cartas, setCartas] = useState<CartaItem[]>(initialCartas)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selected, setSelected] = useState<number[]>([])

  function getNextNumero() {
    return cartas.length ? Math.max(...cartas.map((c) => c.numero)) + 1 : 1
  }

  function handleCreate(data: Omit<CartaItem, 'numero'> & { llifepoints?: number }) {
    const nuevo = { ...data, numero: getNextNumero() }
    setCartas((s) => [...s, nuevo as CartaItem])
    setSelectedIndex(cartas.length)
  }

  function toggleSelect(numero: number) {
    setSelected((s) => {
      if (s.includes(numero)) return s.filter((n) => n !== numero)
      return [...s, numero]
    })
  }

  function handleDeleteClick() {
    if (!selectionMode) {
      setSelectionMode(true)
      setSelected([])
      return
    }

   
    if (selected.length === 0) {
      setSelectionMode(false)
      return
    }

 
    setCartas((s) => s.filter((c) => !selected.includes(c.numero)))
    setSelectionMode(false)
    setSelected([])
    setSelectedIndex(null)
  }

  return (
    <div className="mazo-container">
      <div className="top-controls">
        <button className="create-card-button" onClick={() => setShowCreate(true)}>Crear carta</button>
        <button className={"delete-card-button" + (selectionMode ? ' active' : '')} onClick={handleDeleteClick}>{selectionMode ? 'Confirmar borrar' : 'Borrar carta'}</button>
      </div>

      {cartas.length === 0 ? (
        <div className="empty-state"><div className="label">Agrega una carta</div></div>
      ) : (
        <div className="mazo">
          {cartas.map((c, i) => (
            <Carta
              key={c.numero}
              {...c}
              expanded={selectedIndex === i}
              onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
              selectable={selectionMode}
              isSelected={selected.includes(c.numero)}
              onSelect={() => toggleSelect(c.numero)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <VistaCreaCarta
          nextNumero={getNextNumero()}
          onClose={() => setShowCreate(false)}
          onCreate={(data) => {
            handleCreate(data)
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}

export default Mazo