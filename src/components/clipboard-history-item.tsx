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
    <article className="rounded-[24px] border border-white/10 bg-[#14101E]/90 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-0.5 hover:border-[#4DA3FF]/20 hover:bg-[#1B1334]/95">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="max-h-20 overflow-hidden text-[14px] leading-7 text-slate-100">{getItemLabel(item)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-2.5 py-1 font-medium text-slate-300">
              <ClockIcon className="h-3.5 w-3.5 text-[#6BCBFF]" />
              {formatTimestamp(item.createdAt)}
            </span>
            <span className="truncate font-medium text-slate-400">{renderMeta(item)}</span>
          </div>
        </div>
        {item.pinned ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4DA3FF] to-[#6BCBFF] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#04172F] shadow-[0_12px_24px_rgba(77,163,255,0.22)]">
            <PinIcon className="h-3 w-3 text-[#04172F]" />
            Pinned
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPin(item.id)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold text-slate-100 transition duration-200 hover:border-[#4DA3FF]/30 hover:bg-[#19132A]"
        >
          <PinIcon className="h-3.5 w-3.5 text-[#6BCBFF]" />
          {item.pinned ? "Unpin" : "Pin"}
        </button>
        {item.type === "text" ? (
          <button
            type="button"
            onClick={() => onCopy(item)}
            disabled={isCopying}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0F1220] px-4 py-2 text-[12px] font-semibold text-[#DDE9FF] transition duration-200 hover:border-[#4DA3FF]/30 hover:bg-[#14152A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CopyIcon className="h-3.5 w-3.5 text-[#4DA3FF]" />
            {isCopying ? "Copying" : "Copy"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="inline-flex items-center gap-2 rounded-full border border-[#FF5C8A]/30 bg-[#2F102A] px-4 py-2 text-[12px] font-semibold text-[#FFB3CA] transition duration-200 hover:bg-[#3B1638]"
        >
          <TrashIcon className="h-3.5 w-3.5 text-[#FF7BA2]" />
          Delete
        </button>
      </div>
    </article>
  )
}
