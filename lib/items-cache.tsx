"use client"

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

export interface CachedSpaceRef {
  id: string
  name: string
  level: number
}

export interface CachedItem {
  id: string
  name: string
  quantity: number
  category?: string
  expire_date?: string
  space_id: string
  spaces: CachedSpaceRef
  value?: number
  brand?: string
  purchase_date?: string
  purchase_source?: string
  notes?: string
  condition?: string
  priority?: string
  photo_url?: string
  created_at?: string
  user_id?: string
}

interface ItemsCacheContextType {
  items: CachedItem[]
  loaded: boolean
  refreshing: boolean
  refresh: () => Promise<CachedItem[]>
  addItem: (item: CachedItem) => void
  updateItem: (item: CachedItem) => void
  removeItem: (itemId: string) => void
}

const ItemsCacheContext = createContext<ItemsCacheContextType | undefined>(undefined)

export function ItemsCacheProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CachedItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const inflight = useRef<Promise<CachedItem[]> | null>(null)

  const refresh = useCallback(async () => {
    if (inflight.current) return inflight.current
    setRefreshing(true)
    const p = (async () => {
      try {
        const res = await fetch('/api/items')
        if (!res.ok) {
          // do not throw, keep old cache
          return items
        }
        const data = await res.json()
        const next: CachedItem[] = Array.isArray(data.items) ? data.items : []
        setItems(next)
        setLoaded(true)
        return next
      } catch {
        // network failure: keep existing cache
        setLoaded(true)
        return items
      } finally {
        setRefreshing(false)
        inflight.current = null
      }
    })()
    inflight.current = p
    return p
  }, [items])

  const addItem = useCallback((item: CachedItem) => {
    setItems(prev => {
      const existsIndex = prev.findIndex(i => i.id === item.id)
      if (existsIndex >= 0) {
        const copy = prev.slice()
        copy[existsIndex] = item
        return copy
      }
      return [item, ...prev]
    })
  }, [])

  const updateItem = useCallback((item: CachedItem) => {
    setItems(prev => prev.map(it => (it.id === item.id ? item : it)))
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(it => it.id !== itemId))
  }, [])

  const value = useMemo(
    () => ({ items, loaded, refreshing, refresh, addItem, updateItem, removeItem }),
    [items, loaded, refreshing, refresh, addItem, updateItem, removeItem]
  )

  return (
    <ItemsCacheContext.Provider value={value}>{children}</ItemsCacheContext.Provider>
  )
}

export function useItemsCache() {
  const ctx = useContext(ItemsCacheContext)
  if (!ctx) throw new Error('useItemsCache must be used within ItemsCacheProvider')
  return ctx
}


