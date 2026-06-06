import { useEffect, useMemo, useState } from "react"
import { useClipboardStore } from "./src/store/clipboard-store"
import { ClipboardSearch } from "./src/components/clipboard-search"
import { ClipboardHistoryItem } from "./src/components/clipboard-history-item"
import { ExportImportMenu } from "./src/components/export-import-menu"
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
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    loadClipboardItems().catch(() => {
      setStatusMessage("Unable to load clipboard history")
    })
  }, [loadClipboardItems])

  const filteredItems = useMemo(
    () =>
      items
        .slice()
        .sort((a, b) => {
          if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1
          }

          return b.createdAt - a.createdAt
        })
        .filter((item) =>
          getClipboardSearchText(item).includes(searchTerm.toLowerCase())
        ),
    [items, searchTerm]
  )

  async function handleCopy(item: ClipboardItem) {
    if (item.type !== "text") {
      return
    }

    setCopyingId(item.id)

    try {
      await copyTextToClipboard(item.content)
      setStatusMessage("Copied to clipboard")
    } catch {
      setStatusMessage("Copy failed")
    } finally {
      setCopyingId(null)
      window.setTimeout(() => setStatusMessage(null), 1500)
    }
  }

  function handleDelete(id: string) {
    deleteClipboardItem(id)
  }

  function handlePinToggle(id: string) {
    toggleClipboardItemPin(id).catch(() => {
      setStatusMessage("Unable to update pin state")
      window.setTimeout(() => setStatusMessage(null), 1500)
    })
  }

  function handleClearAll() {
    const confirmed = window.confirm("Clear all clipboard history? This cannot be undone.")
    if (!confirmed) {
      return
    }

    clearClipboardItems().catch(() => {
      setStatusMessage("Unable to clear history")
      window.setTimeout(() => setStatusMessage(null), 1500)
    })
  }

  return (
    <div className="min-h-[520px] w-[360px] rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200">
      <header className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Clipstash</h1>
            <p className="text-sm text-slate-500">Recent clipboard items</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportImportMenu
              onStatusMessage={(msg) => {
                setStatusMessage(msg)
                window.setTimeout(() => setStatusMessage(null), 2500)
              }}
            />
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
            >
              Clear all
            </button>
          </div>
        </div>
      </header>

      <ClipboardSearch value={searchTerm} onChange={setSearchTerm} />

      {statusMessage ? (
        <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 shadow-sm">
          {statusMessage}
        </div>
      ) : null}

      <main className="mt-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            No clipboard history yet. Copy any text to start.
          </div>
        ) : (
          filteredItems.map((item) => (
            <ClipboardHistoryItem
              key={item.id}
              item={item}
              onCopy={handleCopy}
              onPin={handlePinToggle}
              onDelete={handleDelete}
              isCopying={copyingId === item.id}
            />
          ))
        )}
      </main>
    </div>
  )
}

export default IndexPopup
