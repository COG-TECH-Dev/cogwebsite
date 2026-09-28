'use server'

import { getPayloadClient } from '@/lib/payload'
import type { FormSubmission } from '@/payload-types'

export type FormState = { status: 'idle' | 'success' | 'error'; message?: string }

// Bots tend to fill every field they find, including ones hidden from real
// visitors via CSS. If this one's non-empty, silently pretend to succeed —
// tipping off a bot that it was caught just teaches it to leave the field
// blank next time.
function isSpam(formData: FormData): boolean {
  return String(formData.get('website') || '').length > 0
}

export async function submitPrayerRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isSpam(formData)) {
    return { status: 'success', message: "Thank you — we've received your prayer request." }
  }

  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'prayer-requests',
      data: {
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        request: String(formData.get('request') || ''),
        isConfidential: formData.get('isConfidential') === 'on',
      },
    })
    return { status: 'success', message: "Thank you — we've received your prayer request." }
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}

export async function submitEnquiry(
  formType: 'contact' | 'appointment' | 'membership' | 'reference-letter',
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (isSpam(formData)) {
    return { status: 'success', message: "Thank you — we'll be in touch soon." }
  }

  const payload = await getPayloadClient()
  const interestedMinistry = formData.get('interestedMinistry')

  try {
    await payload.create({
      collection: 'form-submissions',
      data: {
        formType,
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        preferredDate: formData.get('preferredDate') ? String(formData.get('preferredDate')) : undefined,
        interestedMinistry: interestedMinistry ? Number(interestedMinistry) : undefined,
        letterType: (formData.get('letterType') as FormSubmission['letterType']) || undefined,
        purpose: formData.get('purpose') ? String(formData.get('purpose')) : undefined,
        requiredByDate: formData.get('requiredByDate') ? String(formData.get('requiredByDate')) : undefined,
        message: String(formData.get('message') || ''),
      },
    })
    return { status: 'success', message: "Thank you — we'll be in touch soon." }
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}

export async function submitTestimony(_prev: FormState, formData: FormData): Promise<FormState> {
  const successMessage = "Thank you for sharing — our team will review it before it's shared publicly."

  if (isSpam(formData)) {
    return { status: 'success', message: successMessage }
  }

  const payload = await getPayloadClient()
  const relatedMinistry = formData.get('relatedMinistry')

  try {
    await payload.create({
      collection: 'testimonials',
      data: {
        name: String(formData.get('name') || ''),
        submitterEmail: String(formData.get('email') || ''),
        quote: String(formData.get('quote') || ''),
        relatedMinistry: relatedMinistry ? Number(relatedMinistry) : undefined,
        // Never trust the client for these — every public submission starts
        // hidden until a Content Editor+ reviews and approves it.
        status: 'pending-review',
        featured: false,
      },
    })
    return { status: 'success', message: successMessage }
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}
