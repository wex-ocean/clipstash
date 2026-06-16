import { useEffect, useRef, useState } from "react"
import { useClipboardStore } from "../store/clipboard-store"
import {
  buildExportPayload,
  downloadExportFile,
  parseExportFile,
  prepareImport,
  readFileAsText
} from "../services/clipboard-export-import"
import { ExportIcon, ImportIcon, MoreIcon } from "./icons"

interface ExportImportMenuProps {
  onStatusMessage: (message: string, tone?: "info" | "success" | "error") => void
}

export function ExportImportMenu({ onStatusMessage }: ExportImportMenuProps) {
  const items = useClipboardStore((state) => state.items)
  const importClipboardItems = useClipboardStore((state) => state.importClipboardItems)
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDown)
    }

    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [isOpen])

  function handleExport() {
    setIsOpen(false)

    if (items.length === 0) {
      onStatusMessage("Nothing to export", "info")
      return
    }

    try {
      const payload = buildExportPayload(items)
      downloadExportFile(payload)
      onStatusMessage(`Exported ${payload.itemCount} item${payload.itemCount !== 1 ? "s" : ""}`, "success")
    } catch {
      onStatusMessage("Export failed", "error")
    }
  }

  function handleImportClick() {
    setIsOpen(false)
    fileInputRef.current?.click()
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    event.target.value = ""

    if (!file.name.endsWith(".json")) {
      onStatusMessage("Please select a .json file", "error")
      return
    }

    setIsImporting(true)

    try {
      const text = await readFileAsText(file)
      const exportData = parseExportFile(text)
      const { toInsert, skipped, errors } = prepareImport(exportData, items)

      if (toInsert.length === 0) {
        const reason = skipped > 0 ? "All items already exist" : "No valid items found"
        onStatusMessage(reason, "info")
        return
      }

      const count = await importClipboardItems(toInsert)
      let msg = `Imported ${count} item${count !== 1 ? "s" : ""}`
      if (skipped > 0) msg += `, ${skipped} skipped (duplicates)`
      if (errors.length > 0) msg += `, ${errors.length} error${errors.length !== 1 ? "s" : ""}`
      onStatusMessage(msg, "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed"
      onStatusMessage(message, "error")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        disabled={isImporting}
        className="inline-flex items-center gap-2 rounded-full border border-[#4DA3FF]/20 bg-[#14101E] px-4 py-2 text-[12px] font-semibold text-[#DDE9FF] transition duration-200 hover:border-[#6BCBFF]/30 hover:bg-[#1A1134] disabled:opacity-60"
        aria-label="Export or import clipboard history"
        aria-expanded={isOpen}
      >
        {isImporting ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
            Importing…
          </span>
        ) : (
          <>
            <MoreIcon className="h-4 w-4 text-[#4DA3FF]" />
            Actions
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-56 overflow-hidden rounded-[20px] border border-white/10 bg-[#0E0C16]/95 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <button
            type="button"
            onClick={handleExport}
            className="flex w-full items-center gap-2 rounded-[16px] px-4 py-3 text-left text-[13px] font-semibold text-slate-200 transition duration-200 hover:bg-white/5"
          >
            <ExportIcon className="h-4 w-4 text-[#6BCBFF]" />
            Export history
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="mt-1 flex w-full items-center gap-2 rounded-[16px] px-4 py-3 text-left text-[13px] font-semibold text-slate-200 transition duration-200 hover:bg-white/5"
          >
            <ImportIcon className="h-4 w-4 text-[#4DA3FF]" />
            Import history
          </button>
        </div>
      )}

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
