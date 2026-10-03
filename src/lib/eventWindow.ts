import type { Where } from 'payload'

// An event stays "upcoming" until it has finished, not just until it has
// started — a three-day conference that began yesterday is still on. End dates
// are stored as dates, so an event ending today counts as running all day.
function bounds() {
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setUTCHours(0, 0, 0, 0)
  return { now: now.toISOString(), startOfToday: startOfToday.toISOString() }
}

export function upcomingEventsWhere(): Where {
  const { now, startOfToday } = bounds()
  return { or: [{ startDate: { greater_than_equal: now } }, { endDate: { greater_than_equal: startOfToday } }] }
}

export function pastEventsWhere(): Where {
  const { now, startOfToday } = bounds()
  return {
    and: [
      { startDate: { less_than: now } },
      { or: [{ endDate: { exists: false } }, { endDate: { less_than: startOfToday } }] },
    ],
  }
}
