/**
 * Requests for a baby dedication or a naming ceremony, and the church's own rules for them. Dedications are held on the
 * last Sunday of the month and the church needs at least 10 days' notice, so the form offers only the Sundays that are
 * still possible, and the server checks the choice again.
 */
export const LIFE_EVENT_TYPES = [
  { value: 'baby-dedication', label: 'Baby dedication', purpose: 'Baby dedication', subject: 'Baby Dedication' },
  { value: 'naming-ceremony', label: 'Naming ceremony', purpose: 'Naming ceremony', subject: 'NAMING CEREMONY' },
] as const

export type LifeEventType = (typeof LIFE_EVENT_TYPES)[number]['value']
export const isLifeEventType = (value: unknown): value is LifeEventType => LIFE_EVENT_TYPES.some((t) => t.value === value)

/** How many days before a dedication the church needs to hear about it. */
export const DEDICATION_NOTICE_DAYS = 10

const DAY = 86_400_000

/** Today's date in the UK, as a UTC midnight timestamp (so it can be compared with other whole dates). */
function ukToday(now: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return Date.UTC(get('year'), get('month') - 1, get('day'))
}

/** The last Sunday of a month (month 1 to 12), as a UTC midnight timestamp. */
function lastSunday(year: number, month: number): number {
  const lastDay = new Date(Date.UTC(year, month, 0))
  return Date.UTC(year, month - 1, lastDay.getUTCDate() - lastDay.getUTCDay())
}

const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const longDate = (ms: number) => new Date(ms).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/** The next last-Sundays that are at least 10 days away, as { value: '2026-11-29', label: 'Sunday 29 November 2026' }. */
export function dedicationSundays(now: Date = new Date(), count = 12): { value: string; label: string }[] {
  const today = ukToday(now)
  const start = new Date(today)
  const out: { value: string; label: string }[] = []
  for (let i = 0; i < 30 && out.length < count; i++) {
    const index = start.getUTCMonth() + i
    const sunday = lastSunday(start.getUTCFullYear() + Math.floor(index / 12), (index % 12) + 1)
    if ((sunday - today) / DAY >= DEDICATION_NOTICE_DAYS) out.push({ value: isoDate(sunday), label: longDate(sunday) })
  }
  return out
}

/** A date such as "2026-11-29" written out in full, or the original text if it is not a date. */
export function formatDate(value: string): string {
  const ms = Date.parse(`${value}T00:00:00Z`)
  return Number.isNaN(ms) ? value : longDate(ms)
}

/** Whether a date (YYYY-MM-DD) is today or later in the UK. */
export function isTodayOrLater(value: string, now: Date = new Date()): boolean {
  const ms = Date.parse(`${value}T00:00:00Z`)
  return !Number.isNaN(ms) && ms >= ukToday(now)
}
