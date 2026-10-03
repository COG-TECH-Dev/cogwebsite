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
  formType: 'contact' | 'appointment' | 'membership' | 'reference-letter' | 'welfare',
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const successMessage =
    formType === 'welfare'
      ? "Thank you for reaching out — someone from our welfare team will be in touch discreetly."
      : "Thank you — we'll be in touch soon."

  if (isSpam(formData)) {
    return { status: 'success', message: successMessage }
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
        supportType: (formData.get('supportType') as FormSubmission['supportType']) || undefined,
        message: String(formData.get('message') || ''),
      },
    })
    return { status: 'success', message: successMessage }
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}

export async function submitHomegroupJoin(_prev: FormState, formData: FormData): Promise<FormState> {
  const successMessage = 'Thank you — our team will connect you with a homegroup leader soon.'

  if (isSpam(formData)) {
    return { status: 'success', message: successMessage }
  }

  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  // Name and phone are the required way to reach people for this form (email
  // is optional) — enforced here as well as in the collection, not just by
  // the browser's `required` attribute.
  if (!name || !phone) {
    return { status: 'error', message: 'Please enter your name and phone number.' }
  }

  const homegroup = formData.get('interestedHomegroup')
  const email = String(formData.get('email') || '').trim()
  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'form-submissions',
      data: {
        formType: 'homegroup-join',
        name,
        phone,
        email: email || undefined,
        // Empty = "not sure — help me find one near me".
        interestedHomegroup: homegroup ? Number(homegroup) : undefined,
        message: formData.get('message') ? String(formData.get('message')) : undefined,
      },
    })
    return { status: 'success', message: successMessage }
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}

export type StepOfFaithState = { status: 'idle' | 'success' | 'error'; message?: string }

export async function submitStepOfFaith(_prev: StepOfFaithState, formData: FormData): Promise<StepOfFaithState> {
  if (isSpam(formData)) {
    return { status: 'success' }
  }

  const decisionType = formData.get('decisionType') as FormSubmission['decisionType']
  if (!decisionType) {
    return { status: 'error', message: 'Please choose the option that best describes your decision today.' }
  }

  const payload = await getPayloadClient()
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()

  try {
    await payload.create({
      collection: 'form-submissions',
      data: {
        formType: 'step-of-faith',
        decisionType,
        // Genuinely optional here — someone can respond fully anonymously
        // and still see their next steps below.
        name: name || undefined,
        email: email || undefined,
        phone: formData.get('phone') ? String(formData.get('phone')) : undefined,
      },
    })
    return { status: 'success' }
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
