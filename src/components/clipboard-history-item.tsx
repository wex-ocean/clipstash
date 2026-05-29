import type { ClipboardItem } from "../types/clipboard"

interface ClipboardHistoryItemProps {
  item: ClipboardItem
  onCopy: (item: ClipboardItem) => Promise<void>
  onDelete: (id: string) => void
  isCopying: boolean
}

function getItemLabel(item: ClipboardItem) {
  if (item.type === "text") {
    return item.content
  }

  if (item.type === "image") {
    return item.altText || "Image clipboard item"
  }

  return item.rawData || "Clipboard item"
}

function renderSecondary(item: ClipboardItem) {
  if (item.type === "text") {
    return item.source ? `Source: ${item.source}` : null
  }

  if (item.type === "image") {
    return item.source ? `Source: ${item.source}` : null
  }

  return null
}

export function ClipboardHistoryItem({ item, onCopy, onDelete, isCopying }: ClipboardHistoryItemProps) {
  return (
    <div>
      <div>
        <strong>{getItemLabel(item)}</strong>
      </div>
      <div>{renderSecondary(item)}</div>
      <div>
        {item.type === "text" ? (
          <button type="button" onClick={() => onCopy(item)} disabled={isCopying}>
            {isCopying ? "Copying..." : "Copy again"}
          </button>
        ) : null}
        <button type="button" onClick={() => onDelete(item.id)}>
          Delete
        </button>
      </div>
    </div>
  )
}
