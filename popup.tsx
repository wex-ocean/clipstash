import { useEffect, useMemo, useRef, useState } from "react"
import { useClipboardStore } from "./src/store/clipboard-store"
import { ClipboardSearch } from "./src/components/clipboard-search"
import { ClipboardHistoryItem } from "./src/components/clipboard-history-item"
import { ExportImportMenu } from "./src/components/export-import-menu"
import { FilterIcon, SparkIcon } from "./src/components/icons"
import { copyTextToClipboard, getClipboardSearchText } from "./src/utils/clipboard-utils"
import type { ClipboardItem } from "./src/types/clipboard"
import "./src/styles/globals.css"

function IndexPopup() {
  const items = useClipboardStore((state) => state.items)
  const loadClipboardItems = useClipboardStore((state) => state.loadClipboardItems)
  const deleteClipboardItem = useClipboardStore((state) => state.deleteClipboardItem)
  const toggleClipboardItemPin = useClipboardStore((state) => state.toggleClipboardItemPin)
  const clearClipboardItems = useClipboardStore((state) => state.clearClipboardItems)

  const [searchTerm, setSearchTerm] = useState("")
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusTone, setStatusTone] = useState<"info" | "success" | "error">("info")
  const toastTimerRef = useRef<number | null>(null)

  useEffect(() => {
    loadClipboardItems().catch(() => {
      showToast("Unable to load clipboard history", "error")
    })
  }, [loadClipboardItems])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const filteredItems = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    const sorted = items
      .slice()
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1
        }
        return b.createdAt - a.createdAt
      })
      .filter((item) => {
        const matchesSearch = normalized.length === 0 || getClipboardSearchText(item).includes(normalized)
        const matchesPinned = !showPinnedOnly || item.pinned
        return matchesSearch && matchesPinned
      })

    return sorted
  }, [items, searchTerm, showPinnedOnly])

  const pinnedItems = filteredItems.filter((item) => item.pinned)
  const recentItems = filteredItems.filter((item) => !item.pinned)

  function showToast(message: string, tone: "info" | "success" | "error" = "info") {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }

    setStatusMessage(message)
    setStatusTone(tone)
    toastTimerRef.current = window.setTimeout(() => {
      setStatusMessage(null)
    }, 2200)
  }

  async function handleCopy(item: ClipboardItem) {
    if (item.type !== "text") {
      return
    }

    setCopyingId(item.id)

    try {
      await copyTextToClipboard(item.content)
      showToast("Copied to clipboard", "success")
    } catch {
      showToast("Copy failed", "error")
    } finally {
      setCopyingId(null)
    }
  }

  function handleDelete(id: string) {
    deleteClipboardItem(id)
  }

  function handlePinToggle(id: string) {
    toggleClipboardItemPin(id).catch(() => {
      showToast("Unable to update pin state", "error")
    })
  }

  function handleClearAll() {
    const confirmed = window.confirm("Clear all clipboard history? This cannot be undone.")
    if (!confirmed) {
      return
    }

    clearClipboardItems().catch(() => {
      showToast("Unable to clear history", "error")
    })
  }

  return (
    <div className="w-[420px] min-h-[560px] max-h-[680px] overflow-y-auto overflow-x-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_60px_rgba(15,23,42,0.12)]">
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-4 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                <SparkIcon className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-[15px] font-semibold tracking-tight">Clipstash</h1>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-300">
                  Productivity clipboard
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-100">
            {items.length} items
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-slate-200">
            <SparkIcon className="h-3.5 w-3.5" />
            {pinnedItems.length} pinned
          </div>
          <div className="flex items-center gap-2">
            <ExportImportMenu
              onStatusMessage={(message, tone = "info") => showToast(message, tone)}
            />
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-slate-100 transition hover:bg-white/15"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-4">
        <ClipboardSearch value={searchTerm} onChange={setSearchTerm} />

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowPinnedOnly((current) => !current)}
            aria-pressed={showPinnedOnly}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
              showPinnedOnly
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <FilterIcon className="h-3.5 w-3.5" />
            {showPinnedOnly ? "Favorites only" : "All items"}
          </button>
          <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
            {filteredItems.length} shown
          </div>
        </div>

        {statusMessage ? (
          <div
            className={`mt-3 flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-sm ${
              statusTone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : statusTone === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
            role="status"
          >
            <SparkIcon className="h-4 w-4" />
            <span>{statusMessage}</span>
          </div>
        ) : null}

        <main className="mt-3 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                <SparkIcon className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-sm font-semibold text-slate-800">Nothing to show yet</h2>
              <p className="mt-1 text-sm text-slate-500">
                {showPinnedOnly
                  ? "No favorites saved yet. Pin a clipboard item to keep it handy."
                  : "Copy content in Chrome and it will appear here instantly."}
              </p>
            </div>
          ) : (
            <>
              {pinnedItems.length > 0 ? (
                <section className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Pinned
                    </h2>
                  </div>
                  {pinnedItems.map((item) => (
                    <ClipboardHistoryItem
                      key={item.id}
                      item={item}
                      onCopy={handleCopy}
                      onPin={handlePinToggle}
                      onDelete={handleDelete}
                      isCopying={copyingId === item.id}
                    />
                  ))}
                </section>
              ) : null}

              {recentItems.length > 0 ? (
                <section className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Recent
                    </h2>
                  </div>
                  {recentItems.map((item) => (
                    <ClipboardHistoryItem
                      key={item.id}
                      item={item}
                      onCopy={handleCopy}
                      onPin={handlePinToggle}
                      onDelete={handleDelete}
                      isCopying={copyingId === item.id}
                    />
                  ))}
                </section>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default IndexPopup
