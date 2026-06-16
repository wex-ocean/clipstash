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
    <div className="w-[420px] min-h-[560px] max-h-[680px] overflow-y-auto overflow-x-hidden rounded-[28px] border border-white/10 bg-[#0B0B12]/95 shadow-[0_32px_80px_rgba(7,8,18,0.85)] backdrop-blur-xl">
      <div className="rounded-t-[28px] border-b border-white/10 bg-gradient-to-br from-[#24124D]/95 via-[#1A103D]/90 to-[#0B0B12]/95 px-5 py-5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-white/10 ring-1 ring-white/10 backdrop-blur-xl">
                <SparkIcon className="h-5 w-5 text-[#6BCBFF]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[18px] font-semibold tracking-tight text-white">Clipstash</h1>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-300">
                  Clipboard productivity
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-full border border-[#4DA3FF]/25 bg-[#14101D]/95 px-4 py-1.5 text-[12px] font-semibold text-[#DDE9FF] shadow-[0_10px_30px_rgba(77,163,255,0.12)]">
            {items.length} items
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-slate-200 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
            <SparkIcon className="h-3.5 w-3.5 text-[#4DA3FF]" />
            {pinnedItems.length} pinned
          </div>
          <div className="flex items-center gap-2">
            <ExportImportMenu
              onStatusMessage={(message, tone = "info") => showToast(message, tone)}
            />
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-full border border-[#6BCBFF]/20 bg-[#14101D] px-4 py-2 text-[12px] font-semibold text-[#E6F3FF] transition duration-200 hover:border-[#6BCBFF]/40 hover:bg-[#1D1336]"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-5">
        <ClipboardSearch value={searchTerm} onChange={setSearchTerm} />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowPinnedOnly((current) => !current)}
            aria-pressed={showPinnedOnly}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition duration-200 ${
              showPinnedOnly
                ? "bg-gradient-to-r from-[#4DA3FF] to-[#6BCBFF] text-[#04172F] shadow-[0_16px_40px_rgba(77,163,255,0.25)]"
                : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            <FilterIcon className="h-4 w-4" />
            {showPinnedOnly ? "Favorites only" : "All items"}
          </button>
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
            {filteredItems.length} shown
          </div>
        </div>

        {statusMessage ? (
          <div
            className={`mt-4 flex items-center gap-2 rounded-[20px] border px-4 py-3 text-sm shadow-[0_18px_50px_rgba(0,0,0,0.15)] ${
              statusTone === "success"
                ? "border-[#4DA3FF]/20 bg-[#0F172A]/90 text-[#B9E3FF]"
                : statusTone === "error"
                  ? "border-[#FF5C8A]/20 bg-[#30132A]/95 text-[#FFC6D1]"
                  : "border-[#FFFFFF]/10 bg-[#13101E]/90 text-slate-200"
            }`}
            role="status"
          >
            <SparkIcon className="h-4 w-4 text-[#4DA3FF]" />
            <span>{statusMessage}</span>
          </div>
        ) : null}

        <main className="mt-4 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#4DA3FF]/20 bg-[#13101E]/80 px-5 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/10 text-[#6BCBFF] shadow-[0_24px_70px_rgba(77,163,255,0.12)]">
                <SparkIcon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-white">Nothing to show yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
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
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
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
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
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
