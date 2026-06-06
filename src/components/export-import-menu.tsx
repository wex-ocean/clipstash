import { useRef, useState } from "react"
import { useClipboardStore } from "../store/clipboard-store"
import {
  buildExportPayload,
  downloadExportFile,
  parseExportFile,
  prepareImport,
  readFileAsText
} from "../services/clipboard-export-import"

interface ExportImportMenuProps {
  onStatusMessage: (message: string) => void
}

export function ExportImportMenu({ onStatusMessage }: ExportImportMenuProps) {
  const items = useClipboardStore((state) => state.items)
  const importClipboardItems = useClipboardStore((state) => state.importClipboardItems)
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    setIsOpen(false)

    if (items.length === 0) {
      onStatusMessage("Nothing to export")
      return
    }

    try {
      const payload = buildExportPayload(items)
      downloadExportFile(payload)
      onStatusMessage(`Exported ${payload.itemCount} item${payload.itemCount !== 1 ? "s" : ""}`)
    } catch {
      onStatusMessage("Export failed")
    }
  }

  function handleImportClick() {
    setIsOpen(false)
    fileInputRef.current?.click()
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset input so re-selecting the same file triggers onChange again
    event.target.value = ""

    if (!file.name.endsWith(".json")) {
      onStatusMessage("Please select a .json file")
      return
    }

    setIsImporting(true)

    try {
      const text = await readFileAsText(file)
      const exportData = parseExportFile(text)
      const { toInsert, skipped, errors } = prepareImport(exportData, items)

      if (toInsert.length === 0) {
        const reason = skipped > 0 ? "All items already exist" : "No valid items found"
        onStatusMessage(reason)
        return
      }

      const count = await importClipboardItems(toInsert)
      let msg = `Imported ${count} item${count !== 1 ? "s" : ""}`
      if (skipped > 0) msg += `, ${skipped} skipped (duplicates)`
      if (errors.length > 0) msg += `, ${errors.length} error${errors.length !== 1 ? "s" : ""}`
      onStatusMessage(msg)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed"
      onStatusMessage(message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isImporting}
        className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
        aria-label="Export or import clipboard history"
        aria-expanded={isOpen}
      >
        {isImporting ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            Importing…
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
            More
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu on click outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={handleExport}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-slate-500"
                aria-hidden="true"
              >
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              Export history
            </button>
            <div className="border-t border-slate-100" />
            <button
              type="button"
              onClick={handleImportClick}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-slate-500"
                aria-hidden="true"
              >
                <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              Import history
            </button>
          </div>
        </>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileSelected}
        aria-hidden="true"
      />
    </div>
  )
}
