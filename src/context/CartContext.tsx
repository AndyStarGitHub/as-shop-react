import React, { createContext, useContext, useEffect, useReducer, useState} from "react";
import type { ReactNode } from 'react'
import type { CartAction, CartItem } from "../types";

interface CartContextType {
  cartItems: CartItem[]
  dispatch: React.Dispatch<any>
  totalPrice: number
  totalQuantity: number
  isOrderModalOpen: boolean
  setIsOrderModalOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function CartReducer(state: any[], action: CartAction): any[] {
  switch (action.type) {
    case 'ADD_ITEM':
      const existing = state.find(item => item.id === action.product.id)
      if (existing) {
        return state.map(item =>
          item.id === action.product.id
            ? {...item, quantity: (item.quantity || 1) + 1}
            : item
        )
      }
      return [...state, {...action.product, quantity: 1 }]

    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.id)

    case 'CLEAR_CART': 
      return []

    case 'SET_CART':
      return action.items

    case 'UPDATE_QUANTITY':
      return state.map(item => {
        if (item.id === action.id) {
          const newQty = (item.quantity || 1) + action.delta
          return { ...item, quantity: newQty < 1 ? 1 : newQty}
        }
        return item
      })

    default:
      return state
  }
}

export const CartProvider = ({ children }: {children: ReactNode }) => {
    const [cartItems, dispatch] = useReducer(CartReducer, [], () => {
      const saved = localStorage.getItem('as_shop_cart')
      return saved ? JSON.parse(saved) : []
    })

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

    useEffect(() => {
        localStorage.setItem('as_shop_cart', JSON.stringify(cartItems))
    }, [cartItems])

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    return (
      <CartContext.Provider value={{ 
        cartItems, 
        dispatch, 
        totalPrice, 
        totalQuantity, 
        isOrderModalOpen,
        setIsOrderModalOpen,
      }}>
        {children}
      </CartContext.Provider>
    )
}

export const useCart = () =>    {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be user within a CardProvider ')
  return context
}
