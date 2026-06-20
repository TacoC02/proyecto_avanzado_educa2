// App.tsx
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Mazo from './Componentes/VistaMazo'
import CrearCartaPage from './pages/CrearCartaPage'
import EditarCartaPage from './pages/EditarCartaPage'
import CardDetailPage from './pages/CardDetailPage'
import BattlePage from './pages/BattlePage'
import SelectFieldPage from './pages/SelectFieldPage'
import GenerarCartaIAPage from './pages/GenerarCartaIAPage'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/card" replace />} />
        <Route path="/card" element={<Mazo />} />
        <Route path="/card/create" element={<CrearCartaPage />} />
        <Route path="/card/edit/:id" element={<EditarCartaPage />} />
        <Route path="/card/:id" element={<CardDetailPage />} />
        <Route path="/card/select-field" element={<SelectFieldPage />} />
        <Route path="/card/battle" element={<BattlePage />} />
        <Route path="/generar-carta-ia" element={<GenerarCartaIAPage />} />
        <Route path="*" element={<Navigate to="/card" replace />} />
      </Routes>
    </div>
  )
}

export default App