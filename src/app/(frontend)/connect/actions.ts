'use server'

import { getPayloadClient } from '@/lib/payload'

export type FormState = { status: 'idle' | 'success' | 'error'; message?: string }

export async function submitPrayerRequest(_prev: FormState, formData: FormData): Promise<FormState> {
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
