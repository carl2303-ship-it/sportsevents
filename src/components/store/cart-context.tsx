'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { StoreCartItem } from '@/lib/boost-store/types'

const STORAGE_KEY = 'se-store-cart'

type CartContextValue = {
  items: StoreCartItem[]
  count: number
  subtotal: number
  ready: boolean
  addItem: (item: Omit<StoreCartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readCart(): StoreCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function StoreCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StoreCartItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setItems(readCart())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, ready])

  const addItem = useCallback(
    (item: Omit<StoreCartItem, 'quantity'> & { quantity?: number }) => {
      setItems((prev) => {
        const qty = item.quantity ?? 1
        const existing = prev.find((p) => p.id === item.id)
        if (existing) {
          return prev.map((p) =>
            p.id === item.id
              ? { ...p, quantity: p.quantity + qty }
              : p
          )
        }
        return [...prev, { ...item, quantity: qty }]
      })
    },
    []
  )

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, quantity } : p))
        .filter((p) => p.quantity > 0)
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0)
    const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0)
    return { items, count, subtotal, ready, addItem, removeItem, setQuantity, clear }
  }, [items, ready, addItem, removeItem, setQuantity, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useStoreCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useStoreCart must be used within StoreCartProvider')
  }
  return ctx
}
