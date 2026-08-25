'use server'

import { getPayloadClient } from '@/lib/payload'

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
  formType: 'contact' | 'appointment' | 'membership',
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (isSpam(formData)) {
    return { status: 'success', message: "Thank you — we'll be in touch soon." }
  }

  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'form-submissions',
      data: {
        formType,
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        preferredDate: formData.get('preferredDate') ? String(formData.get('preferredDate')) : undefined,
        message: String(formData.get('message') || ''),
      },
    })
    return { status: 'success', message: "Thank you — we'll be in touch soon." }
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}
