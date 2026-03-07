import { createRoot } from 'react-dom/client';
import App from './App';  
import './index.css';

import { BrowserRouter, Route, Routes } from 'react-router';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <Routes>

    <Route path='/' element={<App />} />

  </Routes>
  </BrowserRouter>
)
