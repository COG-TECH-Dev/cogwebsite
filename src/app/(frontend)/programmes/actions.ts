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
  if (isSpam(formData)) {
    return { status: 'success', message: "You're registered — we look forward to seeing you!" }
  }

  const payload = await getPayloadClient()
  const guests = Number(formData.get('guests')) || 1

  try {
    await payload.create({
      collection: 'event-registrations',
      data: {
        event: eventId,
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        guests,
      },
    })
    return { status: 'success', message: "You're registered — we look forward to seeing you!" }
  } catch (err) {
    // enforceEventCapacity throws a friendly, user-facing message (e.g. "Only
    // 2 spots left") — surface it instead of the generic fallback.
    return {
      status: 'error',
      message: err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.',
    }
  }
}
