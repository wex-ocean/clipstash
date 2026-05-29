import { openDatabase } from "../db/clipstash-db"
import { useClipboardStore } from "../store/clipboard-store"
import type { ClipboardCaptureMessage, ClipboardCaptureResponse } from "../shared/clipboard-messages"
import type { ClipboardItem } from "../types/clipboard"

export async function initializeClipboardBackground() {
  await openDatabase()
}

function isTextDuplicate(content: string, items: ClipboardItem[]): boolean {
  return items.some(
    (item) => item.type === "text" && item.content === content
  )
}

export async function handleClipboardCapture(
  message: ClipboardCaptureMessage
): Promise<ClipboardCaptureResponse> {
  const store = useClipboardStore.getState()

  try {
    const existingItems = await store.loadClipboardItems()
    if (isTextDuplicate(message.payload.content, existingItems)) {
      return {
        success: true,
        duplicate: true
      }
    }

    const created = await store.addClipboardItem({
      type: "text",
      content: message.payload.content,
      pinned: false,
      source: message.payload.source
    })

    return {
      success: true,
      duplicate: false,
      itemId: created.id
    }
  } catch (error) {
    return {
      success: false,
      duplicate: false,
      error: error instanceof Error ? error.message : "unknown error"
    }
  }
}
