import create from "zustand"
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
  setActiveItem: (id: string | null) => void
  clearClipboardItems: () => Promise<void>
}

export const useClipboardStore = create<ClipboardStoreState>((set, get) => ({
  items: [],
  activeItemId: null,
  isLoaded: false,

  loadClipboardItems: async () => {
    const items = await db.clipboardItems.orderBy("createdAt").reverse().toArray()
    set({ items, isLoaded: true })
    return items
  },

  addClipboardItem: async (item) => {
    const timestamp = Date.now()
    const clipboardItem: ClipboardItem = {
      id: generateClipboardItemId(),
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp
    }

    await db.clipboardItems.put(clipboardItem)
    set((state) => ({ items: [clipboardItem, ...state.items] }))
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

  setActiveItem: (id) => set({ activeItemId: id }),

  clearClipboardItems: async () => {
    await db.clipboardItems.clear()
    set({ items: [], activeItemId: null })
  }
}))
