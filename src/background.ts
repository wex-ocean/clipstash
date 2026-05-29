import { initializeClipboardBackground, handleClipboardCapture } from "./services/clipboard-background"
import type { ClipboardCaptureMessage, ClipboardCaptureResponse } from "./shared/clipboard-messages"

initializeClipboardBackground().catch((error) => {
  console.error("Clipstash background init failed", error)
})

chrome.runtime.onMessage.addListener(
  (message: ClipboardCaptureMessage, sender, sendResponse) => {
    if (message?.type !== "clipboard/capture") {
      return false
    }

    handleClipboardCapture(message).then((response: ClipboardCaptureResponse) => {
      sendResponse(response)
    })

    return true
  }
)
