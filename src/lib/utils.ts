import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format DB time (e.g. "09:00:00" or "14:30") to 12-hour AM/PM for display. */
export function formatTime12h(t: string): string {
  const part = String(t).slice(0, 5)
  if (part.length < 5) return t
  const [hStr, mStr] = part.split(':')
  const h = parseInt(hStr ?? '0', 10)
  const m = parseInt(mStr ?? '0', 10)
  if (h === 0) return `12:${String(m).padStart(2, '0')} AM`
  if (h === 12) return `12:${String(m).padStart(2, '0')} PM`
  if (h < 12) return `${h}:${String(m).padStart(2, '0')} AM`
  return `${h - 12}:${String(m).padStart(2, '0')} PM`
}
