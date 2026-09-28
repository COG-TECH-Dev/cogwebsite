import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Blocks a new RSVP once an event's capacity (if set) would be exceeded.
 * Only applies to events with registrationEnabled + a numeric capacity —
 * uncapped or registration-closed events skip this entirely. Runs on create
 * only; editing an existing registration's guest count isn't re-checked.
 */
export const enforceEventCapacity: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const eventId = data.event
  if (!eventId) return data

  const event = await req.payload.findByID({ collection: 'events', id: eventId }).catch(() => null)
  if (!event?.registrationEnabled || !event?.capacity) return data

  const existing = await req.payload.find({
    collection: 'event-registrations',
    where: { event: { equals: eventId } },
    limit: 0,
  })

  const alreadyRegistered = existing.docs.reduce(
    (sum, r) => sum + (typeof r.guests === 'number' ? r.guests : 1),
    0,
  )
  const requested = typeof data.guests === 'number' ? data.guests : 1

  if (alreadyRegistered + requested > event.capacity) {
    const remaining = Math.max(event.capacity - alreadyRegistered, 0)
    throw new Error(
      remaining > 0
        ? `Only ${remaining} spot${remaining === 1 ? '' : 's'} left for this event.`
        : 'This event is fully booked.',
    )
  }

  return data
}
