import { create } from "zustand"
import type { ClipboardItem, ClipboardItemUpdate } from "../types/clipboard"
import { db } from "../db/clipstash-db"
import { generateClipboardItemId } from "../models/clipboard-item"

export interface ClipboardStoreState {
  items: ClipboardItem[]
  activeItemId: string | null
  isLoaded: boolean
  loadClipboardItems: () => Promise<ClipboardItem[]>
  addClipboardItem: (item: Omit<ClipboardItem, "id" | "createdAt" | "updatedAt">) => Promise<ClipboardItem>
  updateClipboardItem: (id: string, changes: ClipboardItemUpdate) => Promise<ClipboardItem | undefined>
  deleteClipboardItem: (id: string) => Promise<void>
  toggleClipboardItemPin: (id: string) => Promise<ClipboardItem | undefined>
  setActiveItem: (id: string | null) => void
  clearClipboardItems: () => Promise<void>
  importClipboardItems: (items: ClipboardItem[]) => Promise<number>
}

export const useClipboardStore = create<ClipboardStoreState>((set, get) => ({
  items: [],
  activeItemId: null,
  isLoaded: false,

  loadClipboardItems: async () => {
    const allItems = await db.clipboardItems.orderBy("createdAt").reverse().toArray()
    if (allItems.length > 100) {
      const overflowIds = allItems.slice(100).map((item) => item.id)
      await db.clipboardItems.bulkDelete(overflowIds)
      const items = allItems.slice(0, 100)
      set({ items, isLoaded: true })
      return items
    }

    set({ items: allItems, isLoaded: true })
    return allItems
  },

  addClipboardItem: async (item) => {
    const timestamp = Date.now()
    const clipboardItem: ClipboardItem = {
      id: generateClipboardItemId(),
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp
    } as ClipboardItem

    await db.transaction("rw", db.clipboardItems, async () => {
      await db.clipboardItems.put(clipboardItem)
      const totalCount = await db.clipboardItems.count()
      if (totalCount > 100) {
        const overflowIds = await db.clipboardItems
          .orderBy("createdAt")
          .limit(totalCount - 100)
          .keys()

        await db.clipboardItems.bulkDelete(overflowIds)
      }
    })

    set((state) => {
      const nextItems = [clipboardItem, ...state.items]
        .sort((first, second) => second.createdAt - first.createdAt)
        .slice(0, 100)

      return { items: nextItems }
    })

    return clipboardItem
  },

  updateClipboardItem: async (id, changes) => {
    const updatedAt = Date.now()
    const changesWithTimestamp: ClipboardItemUpdate = {
      ...changes,
      updatedAt
    }

    await db.clipboardItems.update(id, changesWithTimestamp)

    const nextItem = get().items.map((item) =>
      item.id === id ? { ...item, ...changesWithTimestamp } : item
    )

    set({ items: nextItem })
    return nextItem.find((item) => item.id === id)
  },

  deleteClipboardItem: async (id) => {
    await db.clipboardItems.delete(id)
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      activeItemId: state.activeItemId === id ? null : state.activeItemId
    }))
  },

  toggleClipboardItemPin: async (id) => {
    const currentItem = get().items.find((item) => item.id === id)
    if (!currentItem) {
      return undefined
    }

    const updatedAt = Date.now()
    const updates: ClipboardItemUpdate = {
      pinned: !currentItem.pinned,
      updatedAt
    }

    await db.clipboardItems.update(id, updates)

    const nextItems = get().items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    )

    set({ items: nextItems })
    return nextItems.find((item) => item.id === id)
  },

  setActiveItem: (id) => set({ activeItemId: id }),

  clearClipboardItems: async () => {
    await db.clipboardItems.clear()
    set({ items: [], activeItemId: null })
  },

  importClipboardItems: async (items) => {
    if (items.length === 0) return 0

    await db.transaction("rw", db.clipboardItems, async () => {
      await db.clipboardItems.bulkPut(items)
    })

    // Reload full list from DB to ensure consistency
    const allItems = await db.clipboardItems.orderBy("createdAt").reverse().toArray()
    const trimmed = allItems.slice(0, 100)
    if (allItems.length > 100) {
      const overflowIds = allItems.slice(100).map((i) => i.id)
      await db.clipboardItems.bulkDelete(overflowIds)
    }

    set({ items: trimmed, isLoaded: true })
    return items.length
  }
}))
