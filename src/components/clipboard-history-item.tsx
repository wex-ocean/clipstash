import type { ClipboardItem } from "../types/clipboard"

interface ClipboardHistoryItemProps {
  item: ClipboardItem
  onCopy: (item: ClipboardItem) => Promise<void>
  onPin: (id: string) => void
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
  if (item.source) {
    return item.source
  }

  return item.type === "text" ? "Text item" : item.type === "image" ? "Image item" : "Clipboard item"
}

function formatTimestamp(value: number) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export function ClipboardHistoryItem({ item, onCopy, onPin, onDelete, isCopying }: ClipboardHistoryItemProps) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="max-h-16 overflow-hidden text-sm leading-6 text-slate-900">{getItemLabel(item)}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{renderSecondary(item)}</span>
            <span>{formatTimestamp(item.createdAt)}</span>
          </div>
        </div>
        <div className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
          {item.pinned ? "Pinned" : "Recent"}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPin(item.id)}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
        >
          <span aria-hidden="true">{item.pinned ? "📌" : "📍"}</span>
          {item.pinned ? "Unpin" : "Pin"}
        </button>
        {item.type === "text" ? (
          <button
            type="button"
            onClick={() => onCopy(item)}
            disabled={isCopying}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden="true">📋</span>
            {isCopying ? "Copying" : "Copy again"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
        >
          <span aria-hidden="true">🗑️</span>
          Delete
        </button>
      </div>
    </div>
  )
}
