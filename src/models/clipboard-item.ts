import type {
  ClipboardImageItem,
  ClipboardItem,
  ClipboardItemCreateInput,
  ClipboardItemType,
  ClipboardTextItem,
  ClipboardUnknownItem
} from "../types/clipboard"

export const CLIPBOARD_ITEM_TABLE = "clipboardItems"

export function generateClipboardItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `clip-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const now = () => Date.now()

export function createClipboardTextItem(
  content: string,
  options?: {
    source?: string
    tags?: string[]
    pinned?: boolean
  }
): ClipboardTextItem {
  return {
    id: generateClipboardItemId(),
    type: "text",
    content,
    createdAt: now(),
    updatedAt: now(),
    pinned: options?.pinned ?? false,
    source: options?.source,
    tags: options?.tags
  }
}

export function createClipboardImageItem(
  imageDataUrl: string,
  options?: {
    source?: string
    altText?: string
    tags?: string[]
    pinned?: boolean
  }
): ClipboardImageItem {
  return {
    id: generateClipboardItemId(),
    type: "image",
    imageDataUrl,
    altText: options?.altText,
    createdAt: now(),
    updatedAt: now(),
    pinned: options?.pinned ?? false,
    source: options?.source,
    tags: options?.tags
  }
}

export function createClipboardUnknownItem(
  rawData: string,
  options?: {
    source?: string
    tags?: string[]
    pinned?: boolean
  }
): ClipboardUnknownItem {
  return {
    id: generateClipboardItemId(),
    type: "unknown",
    rawData,
    createdAt: now(),
    updatedAt: now(),
    pinned: options?.pinned ?? false,
    source: options?.source,
    tags: options?.tags
  }
}

export function isClipboardItem(value: unknown): value is ClipboardItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "type" in value &&
    "createdAt" in value &&
    "updatedAt" in value
  )
}

export function normalizeClipboardItemInput(
  input: ClipboardItemCreateInput,
  type: ClipboardItemType
): ClipboardItem {
  const timestamp = now()
  return {
    id: generateClipboardItemId(),
    createdAt: timestamp,
    updatedAt: timestamp,
    pinned: input.pinned ?? false,
    source: input.source,
    tags: input.tags,
    ...input,
    type
  } as ClipboardItem
}
