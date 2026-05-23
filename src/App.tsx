// App.tsx
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Mazo from './Componentes/VistaMazo'
import CrearCartaPage from './pages/CrearCartaPage'
import EditarCartaPage from './pages/EditarCartaPage'
import CardDetailPage from './pages/CardDetailPage'
import BattlePage from './pages/BattlePage'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/card" replace />} />
        <Route path="/card" element={<Mazo />} />
        <Route path="/card/create" element={<CrearCartaPage />} />
        <Route path="/card/edit/:id" element={<EditarCartaPage />} />
        <Route path="/card/:id" element={<CardDetailPage />} />
        <Route path="/card/battle" element={<BattlePage />} />
        <Route path="*" element={<Navigate to="/card" replace />} />
      </Routes>
    </div>
  )
}

export default App