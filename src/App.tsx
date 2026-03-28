// App.tsx
import './App.css'
import { Navigate, Route, Routes } from 'react-router'
import Mazo from './Componentes/VistaMazo'
import CardDetailPage from './pages/CardDetailPage'
import CrearCartaPage from './pages/CrearCartaPage'
import EditarCartaPage from './pages/EditarCartaPage'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/card" replace />} />
        <Route path="/card" element={<Mazo />} />
        <Route path="/card/create" element={<CrearCartaPage />} />
        <Route path="/card/edit/:id" element={<EditarCartaPage />} />  {}
        <Route path="/card/:id" element={<CardDetailPage />} />
        <Route path="*" element={<Navigate to="/card" replace />} />
      </Routes>
    </div>
  )
}

export default App