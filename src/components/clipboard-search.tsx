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
    <div>
      <input
        type="search"
        value={value}
        onChange={handleInput}
        placeholder="Search clipboard history..."
      />
    </div>
  )
}
