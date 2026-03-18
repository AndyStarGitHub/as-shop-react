import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from "react";
import type { Product } from "../types";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";

type ProductAction = 
| { type: 'SET_PRODUCTS', products: Product[] }
| { type: 'ADD_PRODUCT', product: Product }
| { type: 'UPDATE_PRODUCT', product: Product }
| { type: 'DELETE_PRODUCT', id: string}

function productsReducer (state: Product[], action: ProductAction): Product[] {
  switch(action.type) {
    case 'ADD_PRODUCT':
      return [...state, action.product]

    case 'SET_PRODUCTS':
      return action.products

    case 'DELETE_PRODUCT':
      return state.filter(p => p.id !== action.id)

    case 'UPDATE_PRODUCT':
      return state.map(p => p.id === action.product.id ? action.product : p )
    
      default:
        return state
  }
}

interface ProductContextType {
  products: Product[]
  productsDispatch: React.Dispatch<ProductAction>
  isLoading: boolean
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export const ProductsProvider = ( {children}: {children: ReactNode}) => {
  const [products, productsDispatch] = useReducer(productsReducer, [] as Product[])
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsArray: any[] = [];
      querySnapshot.forEach((doc) => {
        productsArray.push({ ...doc.data(), id: doc.id})
      })

      console.log('Дані отримані з FireBase: ', productsArray)
      productsDispatch({ type: 'SET_PRODUCTS', products: productsArray})
      setIsLoading(false)
      })
      return () => unsubscribe()
    }, [])

  return (
    <ProductContext.Provider value = {{ products, productsDispatch, isLoading}}>
      {children}
    </ProductContext.Provider>
)
}   

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (!context) throw new Error('useProducts must be used within a ProductsProvider')
  return context
}
