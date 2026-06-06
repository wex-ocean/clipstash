import type { ClipboardItem } from "../types/clipboard"
import { isClipboardItem } from "../models/clipboard-item"

/** Version of the export file schema — bump on breaking changes. */
const EXPORT_FORMAT_VERSION = 1

export interface ClipstashExportData {
  version: number
  exportedAt: string
  itemCount: number
  items: ClipboardItem[]
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export function buildExportPayload(items: ClipboardItem[]): ClipstashExportData {
  return {
    version: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    itemCount: items.length,
    items
  }
}

export function downloadExportFile(data: ClipstashExportData): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19)

  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `clipstash-export-${timestamp}.json`
  document.body.appendChild(anchor)
  anchor.click()

  // Clean up
  window.setTimeout(() => {
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }, 100)
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

function validateExportData(raw: unknown): ClipstashExportData {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid file: root value is not an object")
  }

  const obj = raw as Record<string, unknown>

  if (typeof obj.version !== "number" || obj.version < 1) {
    throw new Error("Invalid file: missing or unsupported version")
  }

  if (!Array.isArray(obj.items)) {
    throw new Error("Invalid file: items field is not an array")
  }

  return obj as unknown as ClipstashExportData
}

function deduplicateImports(
  incoming: ClipboardItem[],
  existing: ClipboardItem[]
): { toInsert: ClipboardItem[]; skipped: number } {
  const existingContentSet = new Set(
    existing
      .filter((i) => i.type === "text")
      .map((i) => (i as { content: string }).content)
  )

  const existingIdSet = new Set(existing.map((i) => i.id))

  const toInsert: ClipboardItem[] = []
  let skipped = 0

  for (const item of incoming) {
    // Skip if same ID already exists
    if (existingIdSet.has(item.id)) {
      skipped++
      continue
    }

    // Skip if exact same text content exists
    if (
      item.type === "text" &&
      existingContentSet.has((item as { content: string }).content)
    ) {
      skipped++
      continue
    }

    toInsert.push(item)
  }

  return { toInsert, skipped }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

export function parseExportFile(jsonString: string): ClipstashExportData {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error("File is not valid JSON")
  }

  return validateExportData(parsed)
}

export function prepareImport(
  exportData: ClipstashExportData,
  existingItems: ClipboardItem[]
): { toInsert: ClipboardItem[]; skipped: number; errors: string[] } {
  const errors: string[] = []
  const validItems: ClipboardItem[] = []

  for (let i = 0; i < exportData.items.length; i++) {
    const item = exportData.items[i]
    if (isClipboardItem(item)) {
      validItems.push(item)
    } else {
      errors.push(`Item at index ${i} is malformed and was skipped`)
    }
  }

  const { toInsert, skipped } = deduplicateImports(validItems, existingItems)

  return { toInsert, skipped, errors }
}
