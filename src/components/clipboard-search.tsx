import type { ChangeEvent } from "react"

interface ClipboardSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ClipboardSearch({ value, onChange }: ClipboardSearchProps) {
  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm transition-colors duration-150 focus-within:border-slate-400">
      <input
        className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
        type="search"
        value={value}
        onChange={handleInput}
        placeholder="Search clipboard history..."
      />
    </div>
  )
}
