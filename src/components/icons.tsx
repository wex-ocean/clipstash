import type { ReactNode } from "react"

interface IconProps {
  className?: string
}

function IconShell({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function ClipstashLogoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="clipstash-logo-fill" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6BCBFF" />
          <stop offset="55%" stopColor="#4DA3FF" />
          <stop offset="100%" stopColor="#24124D" />
        </linearGradient>
        <linearGradient id="clipstash-logo-stroke" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EAF6FF" />
          <stop offset="100%" stopColor="#93D8FF" />
        </linearGradient>
      </defs>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.4" fill="url(#clipstash-logo-fill)" opacity="0.95" />
      <path
        d="M8.4 8.1h6.4c1.2 0 2.2 1 2.2 2.2v3.4c0 1.2-1 2.2-2.2 2.2H8.4c-1.2 0-2.2-1-2.2-2.2v-3.4c0-1.2 1-2.2 2.2-2.2Z"
        fill="none"
        stroke="url(#clipstash-logo-stroke)"
        strokeWidth="1.5"
      />
      <path d="M8.4 10.3h4.9" stroke="white" strokeOpacity="0.92" strokeWidth="1.5" />
      <path d="M8.4 13.2h3.2" stroke="white" strokeOpacity="0.82" strokeWidth="1.5" />
      <path d="M15.1 8.8 17.4 6.5" stroke="#EAF6FF" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <circle cx="11" cy="11" r="5.75" />
      <path d="m16.8 16.8 3.7 3.7" />
    </IconShell>
  )
}

export function SparkIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M12 3.2 13.5 8.6 19 10.1 13.5 11.6 12 17l-1.5-5.4L5 10.1l5.5-1.5L12 3.2Z" />
      <path d="M17.8 4.8v2.2" />
      <path d="M19.2 6h-2.2" />
    </IconShell>
  )
}

export function PinIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M12 3.5v3" />
      <path d="M8.1 8.2h7.8l-.9 3h2l-1.8 6.8-2.1-.9-2.1.9-1.8-6.8h2l-1.1-3Z" />
    </IconShell>
  )
}

export function CopyIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <rect x="8.7" y="8.7" width="9.8" height="9.8" rx="2.4" />
      <path d="M5.7 14.7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.7a2 2 0 0 1 2 2v.7" />
    </IconShell>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M4.8 7h14.4" />
      <path d="M9 7V4.8h6V7" />
      <path d="M7.4 7.2 8.2 19h7.6l.8-11.8" />
      <path d="M10.1 10.2v5.4" />
      <path d="M13.9 10.2v5.4" />
    </IconShell>
  )
}

export function FilterIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M4 6.2h16" />
      <path d="M6.8 12h10.4" />
      <path d="M10.4 17.8h3.2" />
    </IconShell>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <circle cx="12" cy="12" r="7.6" />
      <path d="M12 7.2v4.9l3.1 1.9" />
    </IconShell>
  )
}

export function MoreIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <circle cx="5.5" cy="12" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.35" fill="currentColor" stroke="none" />
    </IconShell>
  )
}

export function ExportIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M12 4v11.4" />
      <path d="m7.2 8.8 4.8 4.6 4.8-4.6" />
      <path d="M5.5 19.2h13" />
    </IconShell>
  )
}

export function ImportIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M12 20.5V9.1" />
      <path d="m7.2 14.2 4.8-4.6 4.8 4.6" />
      <path d="M5.5 4.8h13" />
    </IconShell>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="m5.4 12.2 4 4 9.2-9.2" />
    </IconShell>
  )
}
