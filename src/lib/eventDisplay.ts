import type { IconKey } from '@/blocks/iconOptions'

export const TYPE_LABELS: Record<string, string> = {
  programme: 'Programme',
  conference: 'Conference',
  mission: 'Mission',
  regular: 'Regular',
}

export const TYPE_ICONS: Record<string, IconKey> = {
  programme: 'compass',
  conference: 'crown',
  mission: 'globe',
  regular: 'sun',
}

const DAY_MONTH_YEAR = { day: 'numeric', month: 'short', year: 'numeric' } as const

// A single date, or a range like "24–26 Sep 2026" / "30 Sep – 2 Oct 2026" when
// an end date is set and differs from the start date.
export function formatEventDateRange(startDate: string, endDate?: string | null): string {
  const start = new Date(startDate)
  if (!endDate) return start.toLocaleDateString('en-GB', DAY_MONTH_YEAR)

  const end = new Date(endDate)
  if (end.toDateString() === start.toDateString()) {
    return start.toLocaleDateString('en-GB', DAY_MONTH_YEAR)
  }

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const startLabel = start.toLocaleDateString('en-GB', sameMonth ? { day: 'numeric' } : DAY_MONTH_YEAR)
  const endLabel = end.toLocaleDateString('en-GB', DAY_MONTH_YEAR)
  return `${startLabel} – ${endLabel}`
}
