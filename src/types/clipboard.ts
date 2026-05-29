export type ClipboardItemType = "text" | "image" | "unknown"

export interface ClipboardItemBase {
  id: string
  type: ClipboardItemType
  createdAt: number
  updatedAt: number
  pinned: boolean
  source?: string
  tags?: string[]
}

export interface ClipboardTextItem extends ClipboardItemBase {
  type: "text"
  content: string
}

export interface ClipboardImageItem extends ClipboardItemBase {
  type: "image"
  imageDataUrl: string
  altText?: string
}

export interface ClipboardUnknownItem extends ClipboardItemBase {
  type: "unknown"
  rawData?: string
}

export type ClipboardItem = ClipboardTextItem | ClipboardImageItem | ClipboardUnknownItem

export type ClipboardItemCreateInput = Omit<ClipboardItem, "id" | "createdAt" | "updatedAt">
export type ClipboardItemUpdate = Partial<Omit<ClipboardItem, "id" | "createdAt">>
