import type { ClipboardCaptureMessage, ClipboardCaptureResponse } from "../shared/clipboard-messages"

export const config = {
  matches: ["<all_urls>"],
  all_frames: false,
  run_at: "document_idle"
}

const MAX_DUPLICATE_WINDOW_MS = 500
let lastSentText = ""
let lastSentAt = 0

function extractCopyText(event: ClipboardEvent): string | null {
  if (event.clipboardData) {
    const text = event.clipboardData.getData("text/plain")
    if (text?.trim()) {
      return text.trim()
    }
  }

  const selection = window.getSelection()?.toString().trim()
  return selection || null
}

function shouldSendCapture(text: string): boolean {
  const now = Date.now()
  if (text === lastSentText && now - lastSentAt < MAX_DUPLICATE_WINDOW_MS) {
    return false
  }

  lastSentText = text
  lastSentAt = now
  return true
}

async function sendClipboardCapture(text: string) {
  const message: ClipboardCaptureMessage = {
    type: "clipboard/capture",
    payload: {
      content: text,
      source: window.location.href
    }
  }

  return new Promise<ClipboardCaptureResponse>((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response as ClipboardCaptureResponse)
    })
  })
}

function handleCopy(event: ClipboardEvent) {
  const text = extractCopyText(event)
  if (!text || !shouldSendCapture(text)) {
    return
  }

  sendClipboardCapture(text).catch(() => {
    // Fail silently in the content script; background will log if needed.
  })
}

window.addEventListener("copy", handleCopy, true)
