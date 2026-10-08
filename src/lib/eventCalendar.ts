// Date helpers for the month-grid view on Programmes & Events. All days are "YYYY-MM-DD" strings in UK time,
// so an evening event is never shown on the wrong day, whatever the server's own time zone is.

const TZ = 'Europe/London'
const DAY_FORMAT = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })

export type CalendarEvent = {
  id: number
  slug: string
  title: string
  type: string
  startDate: string
  endDate?: string | null
  timeLabel?: string | null
  /** RSVP or volunteering is on, so the link goes straight to the sign-up box. */
  signup: boolean
}

/** The UK calendar day an instant falls on, as "YYYY-MM-DD". */
export const dayKey = (value: string | Date): string => DAY_FORMAT.format(new Date(value))

/** "YYYY-MM" for today. */
export const currentMonthKey = (): string => dayKey(new Date()).slice(0, 7)

/** The month before or after a "YYYY-MM". */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** Weeks (Monday first) of the month: each cell is a "YYYY-MM-DD" day, or null outside the month. */
export function buildMonthGrid(month: string): (string | null)[][] {
  const [y, m] = month.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

/** The first and last day an event covers (a one-day event, or an end date before the start, covers just its start). */
export function eventSpan(e: Pick<CalendarEvent, 'startDate' | 'endDate'>): { start: string; end: string } {
  const start = dayKey(e.startDate)
  const end = e.endDate ? dayKey(e.endDate) : start
  return { start, end: end < start ? start : end }
}

export const eventsOnDay = (events: CalendarEvent[], day: string): CalendarEvent[] =>
  events.filter((e) => {
    const { start, end } = eventSpan(e)
    return start <= day && day <= end
  })
