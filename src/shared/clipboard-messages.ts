export type ClipboardCapturePayload = {
  content: string
  source?: string
}

export type ClipboardCaptureMessage = {
  type: "clipboard/capture"
  payload: ClipboardCapturePayload
}

export type ClipboardCaptureResponse = {
  success: boolean
  duplicate: boolean
  itemId?: string
  error?: string
}
