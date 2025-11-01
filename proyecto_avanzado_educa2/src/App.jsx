import { useState } from 'react'
import './App.css'
import Carta from './componentes/Cartas'
import VistaMazo from './pantallas/VistaMazo'
Carta
useState
VistaMazo

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
    <Carta/>
    <VistaMazo/>
    </div>
  )
}

export default App
