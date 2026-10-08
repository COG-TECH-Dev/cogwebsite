import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { TYPE_LABELS, formatEventDateRange } from '@/lib/eventDisplay'
import { buildMonthGrid, eventSpan, eventsOnDay, type CalendarEvent } from '@/lib/eventCalendar'
import { monthLabel } from '@/lib/eventMonths'

const WEEKDAYS = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' },
]

// A coloured edge by kind of event. Decoration only: the kind is always written out too.
const EDGE: Record<string, string> = {
  conference: 'border-l-gold-500',
  programme: 'border-l-sky-500',
  mission: 'border-l-flame-500',
  regular: 'border-l-brand-400',
}

const MAX_PER_DAY = 3

const longDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

/**
 * The month as a calendar: a grid on larger screens, and a plain day-by-day list on phones (a seven-column
 * grid is too cramped to read there). Every event links to its own page, straight to the sign-up when
 * RSVP or volunteering is on.
 */
export function EventsCalendar({
  month,
  events,
  today,
  prevHref,
  nextHref,
  todayHref,
  listHref,
}: {
  month: string
  events: CalendarEvent[]
  /** "YYYY-MM-DD" in UK time. */
  today: string
  prevHref: string
  nextHref: string
  todayHref: string
  /** The list view of the same month, for "more" links. */
  listHref: string
}) {
  const weeks = buildMonthGrid(month)
  const href = (e: CalendarEvent) => `/programmes/${e.slug}${e.signup && eventSpan(e).end >= today ? '#rsvp' : ''}`
  const ordered = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate))

  // For the phone list: each event once, under the first day of it that falls in this month.
  const firstOfMonth = `${month}-01`
  const agenda = new Map<string, CalendarEvent[]>()
  for (const e of ordered) {
    const { start } = eventSpan(e)
    const day = start < firstOfMonth ? firstOfMonth : start
    agenda.set(day, [...(agenda.get(day) ?? []), e])
  }

  const navLink =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-border px-3 text-sm font-medium text-ink transition-colors hover:bg-brand-50'

  return (
    <section aria-labelledby="calendar-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="calendar-heading" className="font-serif text-2xl font-semibold text-brand-700">
          {monthLabel(month)}
        </h2>
        <nav aria-label="Change month" className="flex items-center gap-2">
          <Link href={prevHref} className={navLink}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Previous month</span>
          </Link>
          <Link href={todayHref} className={navLink}>
            This month
          </Link>
          <Link href={nextHref} className={navLink}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Next month</span>
          </Link>
        </nav>
      </div>

      {/* Larger screens: the month grid */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface sm:block">
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">Events in {monthLabel(month)}</caption>
          <thead>
            <tr>
              {WEEKDAYS.map((d) => (
                <th key={d.short} scope="col" className="border-b border-border bg-brand-50 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  <abbr title={d.full} className="no-underline">
                    {d.short}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((day, di) => {
                  if (!day) return <td key={di} className="h-28 border-b border-l border-border bg-brand-50/40 first:border-l-0" />
                  const dayEvents = eventsOnDay(ordered, day)
                  const isToday = day === today
                  return (
                    <td
                      key={day}
                      aria-current={isToday ? 'date' : undefined}
                      className={`h-28 border-b border-l border-border align-top first:border-l-0 ${isToday ? 'bg-gold-100/60' : ''}`}
                    >
                      <div className="p-1.5">
                        <time
                          dateTime={day}
                          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold ${
                            isToday ? 'bg-gold-500 text-brand-700' : 'text-ink-muted'
                          }`}
                        >
                          {Number(day.slice(8))}
                        </time>
                        {dayEvents.length > 0 && (
                          <ul className="mt-1 space-y-1">
                            {dayEvents.slice(0, MAX_PER_DAY).map((e) => (
                              <li key={e.id}>
                                <Link
                                  href={href(e)}
                                  className={`block rounded-sm border-l-4 bg-brand-50 px-1.5 py-1 text-xs font-medium leading-snug text-brand-700 transition-colors hover:bg-gold-100 ${EDGE[e.type] ?? 'border-l-brand-400'}`}
                                >
                                  <span className="line-clamp-2">{e.title}</span>
                                  {eventSpan(e).start !== day && <span className="block text-[10px] font-normal text-ink-muted">continues</span>}
                                </Link>
                              </li>
                            ))}
                            {dayEvents.length > MAX_PER_DAY && (
                              <li>
                                <Link href={listHref} className="px-1.5 text-xs font-semibold text-brand-600 hover:underline">
                                  +{dayEvents.length - MAX_PER_DAY} more
                                </Link>
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: a day-by-day list */}
      <div className="sm:hidden">
        {agenda.size === 0 ? null : (
          <ol className="space-y-5">
            {[...agenda.entries()].map(([day, list]) => (
              <li key={day}>
                <h3 className={`text-sm font-semibold ${day === today ? 'text-gold-600' : 'text-ink'}`}>
                  <time dateTime={day}>{longDay(day)}</time>
                  {day === today && ' (today)'}
                </h3>
                <ul className="mt-2 space-y-2">
                  {list.map((e) => (
                    <li key={e.id}>
                      <Link
                        href={href(e)}
                        className={`block rounded-xl border border-l-4 border-border bg-surface p-3 shadow-sm ${EDGE[e.type] ?? 'border-l-brand-400'}`}
                      >
                        <span className="block text-xs font-semibold uppercase tracking-wide text-gold-600">{TYPE_LABELS[e.type] ?? e.type}</span>
                        <span className="mt-0.5 block font-serif font-semibold text-brand-700">{e.title}</span>
                        <span className="mt-0.5 block text-sm text-ink-muted">
                          {[formatEventDateRange(e.startDate, e.endDate), e.timeLabel].filter(Boolean).join(' · ')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>

      {events.length === 0 && (
        <p className="mt-4 text-ink-muted">Nothing is scheduled in {monthLabel(month)}. Try another month, or switch to the list.</p>
      )}

      <ul aria-label="Key" className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <li key={type} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`h-3 w-1 rounded-sm border-l-4 ${EDGE[type]}`} />
            {label}
          </li>
        ))}
      </ul>
    </section>
  )
}
