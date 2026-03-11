// 1. Опис типу даних
export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
}

// 1. Опис типу даних
export interface Drink {
  id: number;
  title: string;
  price: number;
  volume: number;
}

// 1. Опис типу даних
export interface Nut {
  id: number;
  title: string;
  price: number;
  large: boolean;
}

export interface Post {
    id: number
    title: string
}

export type CartItem = (Product | Drink | Nut) & { quantity: number}

export interface Category {
  id: string;
  name: string;
  slug?: string;
}