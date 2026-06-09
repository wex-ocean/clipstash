import type { ClipboardItem } from "../types/clipboard"
import { ClockIcon, CopyIcon, PinIcon, TrashIcon } from "./icons"

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

function renderMeta(item: ClipboardItem) {
  if (item.source) {
    return item.source
  }

  return item.type === "text" ? "Text snippet" : item.type === "image" ? "Image" : "Clipboard item"
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
    <article className="rounded-[18px] border border-slate-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="max-h-16 overflow-hidden text-[13px] leading-6 text-slate-800">{getItemLabel(item)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
              <ClockIcon className="h-3.5 w-3.5" />
              {formatTimestamp(item.createdAt)}
            </span>
            <span className="truncate font-medium">{renderMeta(item)}</span>
          </div>
        </div>
        {item.pinned ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
            <PinIcon className="h-3 w-3" />
            Pinned
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPin(item.id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <PinIcon className="h-3.5 w-3.5" />
          {item.pinned ? "Unpin" : "Pin"}
        </button>
        {item.type === "text" ? (
          <button
            type="button"
            onClick={() => onCopy(item)}
            disabled={isCopying}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CopyIcon className="h-3.5 w-3.5" />
            {isCopying ? "Copying" : "Copy"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[12px] font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <TrashIcon className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </article>
  )
}
