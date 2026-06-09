import type { ChangeEvent } from "react"
import { SearchIcon } from "./icons"

interface ClipboardSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ClipboardSearch({ value, onChange }: ClipboardSearchProps) {
  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  return (
    <label className="flex items-center gap-2 rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-sm transition focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-md">
      <SearchIcon className="h-4 w-4 text-slate-400" />
      <input
        className="w-full bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
        type="search"
        value={value}
        onChange={handleInput}
        placeholder="Search clipboard history"
        aria-label="Search clipboard history"
      />
    </label>
  )
}
