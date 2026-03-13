import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Category } from "../types";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";

interface CategoriesContextType {
  categories: Category[]
  isLoading: boolean
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

export const CategoriesProvider = ({ children }: {children: ReactNode}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'categories'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[]
      setCategories(cats)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <CategoriesContext.Provider value = {{ categories, isLoading }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export const useCategories = () => {
  const context = useContext(CategoriesContext)
  if (!context) throw new Error('useCategories must be used within a CategoriesProvider')
  return context
}