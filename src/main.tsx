import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartasProvider } from './contexts/CartasContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <CartasProvider>
      <App />
    </CartasProvider>
  </BrowserRouter>
)
