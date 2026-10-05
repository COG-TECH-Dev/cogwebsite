'use server'

import { getPayloadClient } from '@/lib/payload'
import { CONTACT_PREFERENCES, VISITOR_INTENTS, VISITOR_TYPES } from '@/lib/firstTimer'
import type { FormSubmission, PrayerRequest } from '@/payload-types'

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

  // Anything other than a recognised choice falls back to the safest one.
  const choice = String(formData.get('visibility') || '')
  const visibility: PrayerRequest['visibility'] =
    choice === 'ministry-team' || choice === 'public' ? choice : 'private'

  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'prayer-requests',
      data: {
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        request: String(formData.get('request') || ''),
        visibility,
        isConfidential: visibility === 'private',
        // A public request never appears on the wall until someone approves it.
        approved: false,
      },
    })
    return {
      status: 'success',
      message:
        visibility === 'public'
          ? "Thank you — we've received your prayer request. Our team will read it before it appears on the prayer wall."
          : "Thank you — we've received your prayer request.",
    }
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}

// Shared by the forms below that ask for at least a name plus a way to reach
// the person. Returns a friendly message, or null when the details are fine.
function missingContact(name: string, email: string, phone: string, need: 'email' | 'either'): string | null {
  if (!name) return 'Please enter your name.'
  if (need === 'email' && !email) return 'Please enter your email.'
  if (need === 'either' && !email && !phone) return 'Please give an email or a phone number so we can reach you.'
  return null
}

export async function submitFirstTimer(_prev: FormState, formData: FormData): Promise<FormState> {
  const successMessage = "Thank you for visiting us — we're so glad you came! Someone from our team will be in touch soon."

  if (isSpam(formData)) {
    return { status: 'success', message: successMessage }
  }

  const text = (key: string) => {
    const value = String(formData.get(key) || '').trim()
    return value || undefined
  }
  const oneOf = <T extends string>(key: string, allowed: readonly { value: T }[]): T | undefined => {
    const value = String(formData.get(key) || '')
    return allowed.find((o) => o.value === value)?.value
  }

  const firstName = text('firstName')
  const lastName = text('lastName')
  const email = text('email')
  const phone = text('phone')
  if (!firstName || !lastName) return { status: 'error', message: 'Please enter your first and last name.' }
  if (!email && !phone) return { status: 'error', message: 'Please give an email or a phone number so we can reach you.' }

  // The date of the visit defaults to today when it is left blank.
  const rawVisit = text('visitDate')
  const visitDate = rawVisit && !Number.isNaN(Date.parse(rawVisit)) ? rawVisit : new Date().toISOString().slice(0, 10)

  const homegroup = Number(formData.get('interestedHomegroup'))
  const intents = formData
    .getAll('intents')
    .map(String)
    .filter((v): v is (typeof VISITOR_INTENTS)[number]['value'] => VISITOR_INTENTS.some((o) => o.value === v))

  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'form-submissions',
      data: {
        formType: 'first-timer',
        name: `${firstName} ${lastName}`,
        email,
        phone,
        visitDate,
        campus: text('campus'),
        serviceAttended: text('serviceAttended'),
        address: text('address'),
        postcode: text('postcode'),
        city: text('city'),
        country: text('country'),
        interestedHomegroup: Number.isInteger(homegroup) && homegroup > 0 ? homegroup : undefined,
        contactPreference: oneOf('contactPreference', CONTACT_PREFERENCES) ?? 'yes',
        howHeard: text('howHeard'),
        visitorType: oneOf('visitorType', VISITOR_TYPES),
        intents,
        newsletterOptIn: formData.get('newsletterOptIn') === 'on',
        message: text('message'),
      },
    })
    return { status: 'success', message: successMessage }
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}

export async function submitCampusConnect(_prev: FormState, formData: FormData): Promise<FormState> {
  const successMessage =
    "Thank you — we'll put you in touch with the church closest to where you're moving."

  if (isSpam(formData)) {
    return { status: 'success', message: successMessage }
  }

  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const problem = missingContact(name, email, '', 'email')
  if (problem) return { status: 'error', message: problem }

  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'form-submissions',
      data: {
        formType: 'campus-connect',
        name,
        email,
        phone: formData.get('phone') ? String(formData.get('phone')) : undefined,
        campus: formData.get('campus') ? String(formData.get('campus')) : undefined,
        message: formData.get('message') ? String(formData.get('message')) : undefined,
      },
    })
    return { status: 'success', message: successMessage }
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
  const successMessage = formData.get('interestedHomegroup')
    ? "Thank you — we'll pass your details to that group's leader, and someone will be in touch soon."
    : 'Thank you — our team will connect you with a homegroup leader soon.'

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
