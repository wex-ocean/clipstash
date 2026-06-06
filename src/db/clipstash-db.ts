import Dexie, { type Table } from "dexie"
import type { ClipboardItem } from "../types/clipboard"

export class ClipstashDatabase extends Dexie {
  clipboardItems!: Table<ClipboardItem, string>

  constructor() {
    super("clipstash")

    this.version(1).stores({
      clipboardItems: "id, type, createdAt, updatedAt, pinned, source"
    })
  }
}

export const db = new ClipstashDatabase()

export async function openDatabase(): Promise<void> {
  await db.open()
}
