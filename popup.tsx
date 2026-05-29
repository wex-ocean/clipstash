import { useEffect, useMemo, useState } from "react"
import { useClipboardStore } from "./src/store/clipboard-store"
import { ClipboardSearch } from "./src/components/clipboard-search"
import { ClipboardHistoryItem } from "./src/components/clipboard-history-item"
import { copyTextToClipboard, getClipboardSearchText } from "./src/utils/clipboard-utils"
import type { ClipboardItem } from "./src/types/clipboard"

function IndexPopup() {
  const items = useClipboardStore((state) => state.items)
  const loadClipboardItems = useClipboardStore((state) => state.loadClipboardItems)
  const deleteClipboardItem = useClipboardStore((state) => state.deleteClipboardItem)

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
      items.filter((item) =>
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

  return (
    <div>
      <header>
        <h1>Clipstash</h1>
        <p>Clipboard history</p>
      </header>

      <ClipboardSearch value={searchTerm} onChange={setSearchTerm} />

      {statusMessage ? <div>{statusMessage}</div> : null}

      <main>
        {filteredItems.length === 0 ? (
          <div>No clipboard history found.</div>
        ) : (
          filteredItems.map((item) => (
            <ClipboardHistoryItem
              key={item.id}
              item={item}
              onCopy={handleCopy}
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
