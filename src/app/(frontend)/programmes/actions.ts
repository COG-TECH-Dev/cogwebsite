'use server'

import { getPayloadClient } from '@/lib/payload'

export type RsvpState = { status: 'idle' | 'success' | 'error'; message?: string }

// Same bot-tolerance pattern as connect/actions.ts — a filled honeypot field
// silently "succeeds" instead of revealing it was caught.
function isSpam(formData: FormData): boolean {
  return String(formData.get('website') || '').length > 0
}

export async function submitEventRegistration(
  eventId: number,
  _prev: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const volunteering = formData.get('role') === 'volunteer'
  const successMessage = volunteering
    ? 'Thank you for offering to help! Someone from the team will be in touch about how you can serve.'
    : "You're registered — we look forward to seeing you!"

  if (isSpam(formData)) {
    return { status: 'success', message: successMessage }
  }

  const payload = await getPayloadClient()

  // Only accept what the event actually offers (the form only shows the options that are on,
  // but anyone can post to this action directly).
  const event = await payload
    .find({ collection: 'events', where: { id: { equals: eventId }, _status: { equals: 'published' } }, limit: 1, depth: 0 })
    .then((r) => r.docs[0] ?? null)
    .catch(() => null)
  if (!event || (volunteering ? !event.volunteerEnabled : !event.registrationEnabled)) {
    return {
      status: 'error',
      message: volunteering ? 'Volunteer sign-up is not open for this event.' : 'Sign-up is not open for this event.',
    }
  }

  const guests = volunteering ? 1 : Math.max(1, Math.floor(Number(formData.get('guests')) || 1))

  try {
    await payload.create({
      collection: 'event-registrations',
      data: {
        event: eventId,
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        role: volunteering ? 'volunteer' : 'attendee',
        notes: volunteering && formData.get('notes') ? String(formData.get('notes')) : undefined,
        guests,
      },
    })
    return { status: 'success', message: successMessage }
  } catch (err) {
    // enforceEventCapacity throws a friendly, user-facing message (e.g. "Only
    // 2 spots left") — surface it instead of the generic fallback.
    return {
      status: 'error',
      message: err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.',
    }
  }
}
