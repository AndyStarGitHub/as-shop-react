import './index.css'
import App from './App.tsx'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { ProductsProvider } from './context/ProductContext.tsx'
import { CategoriesProvider } from './context/CategoriesContext.tsx'
import {CartProvider} from './context/CartContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CategoriesProvider>
      <ProductsProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ProductsProvider>
    </CategoriesProvider>
  </React.StrictMode>
)
