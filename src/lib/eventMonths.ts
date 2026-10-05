import type { Where } from 'payload'

// Month filtering for the events list. A month is "YYYY-MM"; an event belongs to
// every month it touches, so a conference running 30 Sep to 2 Oct appears under
// both September and October.

export const MONTH_PARAM = /^\d{4}-(0[1-9]|1[0-2])$/

function bounds(month: string) {
  const [y, m] = month.split('-').map(Number)
  return { start: new Date(Date.UTC(y, m - 1, 1)).toISOString(), end: new Date(Date.UTC(y, m, 1)).toISOString() }
}

export function monthOverlapWhere(month: string): Where {
  const { start, end } = bounds(month)
  return {
    and: [
      { startDate: { less_than: end } },
      {
        or: [
          { endDate: { greater_than_equal: start } },
          { and: [{ endDate: { exists: false } }, { startDate: { greater_than_equal: start } }] },
        ],
      },
    ],
  }
}

/** Every "YYYY-MM" between two dates (capped, so a bad date can't produce a huge list). */
export function monthsCovered(startISO: string, endISO?: string | null): string[] {
  const start = new Date(startISO)
  const end = endISO ? new Date(endISO) : start
  const out: string[] = []
  let y = start.getUTCFullYear()
  let m = start.getUTCMonth()
  while ((y < end.getUTCFullYear() || (y === end.getUTCFullYear() && m <= end.getUTCMonth())) && out.length < 36) {
    out.push(`${y}-${String(m + 1).padStart(2, '0')}`)
    m += 1
    if (m > 11) {
      m = 0
      y += 1
    }
  }
  return out
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}
