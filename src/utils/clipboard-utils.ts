import type { ClipboardItem } from "../types/clipboard"

export function getClipboardSearchText(item: ClipboardItem): string {
  const fields: string[] = [item.type]

  if (item.type === "text") {
    fields.push(item.content)
  }

  if (item.type === "image") {
    fields.push(item.altText ?? "", item.imageDataUrl)
  }

  if (item.type === "unknown") {
    fields.push(item.rawData ?? "")
  }

  if (item.source) {
    fields.push(item.source)
  }

  return fields.join(" ").toLowerCase()
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "absolute"
  textarea.style.left = "-9999px"
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand("copy")
  document.body.removeChild(textarea)
}
