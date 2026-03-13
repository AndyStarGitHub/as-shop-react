import './index.css'
import App from './App.tsx'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { CategoriesProvider } from './context/CategoriesContext.tsx'
import {CartProvider} from './context/CartContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CategoriesProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </CategoriesProvider>
  </React.StrictMode>
)
