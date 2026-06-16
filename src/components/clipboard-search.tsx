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
    <label className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-[#14101E]/90 px-4 py-3 text-slate-200 shadow-[0_18px_60px_rgba(0,0,0,0.25)] transition focus-within:border-[#4DA3FF]/40 focus-within:bg-[#19132A]/90">
      <SearchIcon className="h-4 w-4 text-[#6BCBFF]" />
      <input
        className="w-full bg-transparent text-[13px] text-slate-100 outline-none placeholder:text-slate-500"
        type="search"
        value={value}
        onChange={handleInput}
        placeholder="Search clipboard history"
        aria-label="Search clipboard history"
      />
    </label>
  )
}
