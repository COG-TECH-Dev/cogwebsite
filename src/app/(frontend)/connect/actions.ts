'use server'

import { getPayloadClient } from '@/lib/payload'
import { navLinks } from '@/components/site/navLinks'
import { CONTACT_PREFERENCES, HOW_HEARD, VISITOR_INTENTS, VISITOR_TYPES } from '@/lib/firstTimer'
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

const EMAIL_FORMAT = /^\S+@\S+\.\S+$/
// The consent box is required in the browser too; this stops a form being sent without it.
const consentGiven = (formData: FormData) => formData.get('consent') === 'on'
const NO_CONSENT = 'Please tick the box to agree to your details being used to respond to you.'

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
  // Both ways of reaching the visitor are needed, as the welcome team asked.
  if (!phone) return { status: 'error', message: 'Please enter your phone number.' }
  if (!email || !EMAIL_FORMAT.test(email)) return { status: 'error', message: 'Please enter a valid email address.' }

  // Like the church's New Member form: the date of the visit and the whole address have to be filled in.
  const rawVisit = text('visitDate')
  if (!rawVisit || Number.isNaN(Date.parse(rawVisit))) return { status: 'error', message: 'Please enter the date of your first visit.' }
  const address = text('address')
  const postcode = text('postcode')
  const city = text('city')
  const country = text('country')
  if (!address || !postcode || !city || !country) {
    return { status: 'error', message: 'Please fill in your address, post code, city and country.' }
  }
  const contactPreference = oneOf('contactPreference', CONTACT_PREFERENCES)
  const contactOther = text('contactOther')
  if (!contactPreference) return { status: 'error', message: 'Please tell us whether we can contact you.' }
  if (contactPreference === 'other' && !contactOther) return { status: 'error', message: 'Please tell us how or when we can contact you.' }
  const visitorType = oneOf('visitorType', VISITOR_TYPES)
  if (!visitorType) return { status: 'error', message: 'Please select the one that is applicable to you (Student, Working Professional, Visitor or Others).' }
  // The church visited has to be one of the branches (the form makes the visitor choose, rather than assuming Newcastle).
  const branches = (navLinks.find((l) => l.label === 'Branches')?.children ?? []).map((b) => b.label)
  const campus = text('campus')
  if (branches.length > 0 && (!campus || !branches.includes(campus))) return { status: 'error', message: 'Please choose which church you visited.' }
  // "How did you hear about us" is optional, but when it is "Other" they say how.
  const howHeard = HOW_HEARD.find((o) => o === text('howHeard'))
  const howHeardOther = text('howHeardOther')
  if (howHeard === 'Other' && !howHeardOther) return { status: 'error', message: 'Please tell us how you heard about us.' }
  if (!consentGiven(formData)) return { status: 'error', message: NO_CONSENT }

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
        visitDate: rawVisit,
        campus,
        address,
        postcode,
        city,
        country,
        interestedHomegroup: Number.isInteger(homegroup) && homegroup > 0 ? homegroup : undefined,
        contactPreference,
        contactOther: contactPreference === 'other' ? contactOther : undefined,
        howHeard,
        howHeardOther: howHeard === 'Other' ? howHeardOther : undefined,
        visitorType,
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

export async function submitMinistryMessage(ministryId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const successMessage = 'Thank you! Your message is on its way to the team, and someone will get back to you soon.'

  if (isSpam(formData)) {
    return { status: 'success', message: successMessage }
  }

  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const message = String(formData.get('message') || '').trim()
  const problem = missingContact(name, email, phone, 'email')
  if (problem) return { status: 'error', message: problem }
  if (!message) return { status: 'error', message: 'Please write a short message.' }

  const payload = await getPayloadClient()
  const ministry = Number.isInteger(ministryId)
    ? await payload.findByID({ collection: 'ministries', id: ministryId, depth: 0 }).catch(() => null)
    : null
  if (!ministry) return { status: 'error', message: 'Something went wrong. Please try again.' }

  try {
    await payload.create({
      collection: 'form-submissions',
      data: {
        formType: 'ministry-message',
        name,
        email,
        phone: phone || undefined,
        interestedMinistry: ministry.id,
        message: message.slice(0, 4000),
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
  const generalMessage =
    formType === 'welfare'
      ? "Thank you for reaching out — someone from our welfare team will be in touch discreetly."
      : "Thank you — we'll be in touch soon."

  if (isSpam(formData)) {
    return { status: 'success', message: generalMessage }
  }

  const payload = await getPayloadClient()
  // The welfare team's reply time, when the church has set one in Settings, is part of the confirmation.
  let successMessage = generalMessage
  if (formType === 'welfare') {
    const replyTime = (await payload.findGlobal({ slug: 'settings', depth: 0 }).catch(() => null))?.welfareSupport?.replyTime?.trim()
    if (replyTime) {
      successMessage = `Thank you for reaching out — someone from our welfare team will be in touch discreetly, ${replyTime.replace(/[.\s]+$/, '')}.`
    }
  }
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

  // The team follows everyone up, so name, email and phone are all needed (they used to be optional).
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  if (!name) return { status: 'error', message: 'Please enter your full name.' }
  if (!email || !EMAIL_FORMAT.test(email)) return { status: 'error', message: 'Please enter a valid email address.' }
  if (!phone) return { status: 'error', message: 'Please enter your phone number.' }
  if (!consentGiven(formData)) return { status: 'error', message: NO_CONSENT }

  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'form-submissions',
      data: { formType: 'step-of-faith', decisionType, name, email, phone },
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
