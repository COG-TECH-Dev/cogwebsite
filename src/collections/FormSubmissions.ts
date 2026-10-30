import type { Access, CollectionConfig, PayloadRequest } from 'payload'

import { pastoralReadOnly, publicCreateOnly } from '../access'
import { notifyOnSubmission } from '../hooks/notifyOnSubmission'
import { CONTACT_PREFERENCES, VISITOR_INTENTS, VISITOR_TYPES, firstTimerRecipient, labelFor } from '../lib/firstTimer'
import { totalDisplay } from '../lib/books'
import { LETTER_TYPES } from '../lib/letters'

const dateOnly = (value: unknown) => (value ? new Date(String(value)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined)

// Admins read every submission; the Welfare Team role reads welfare requests and nothing else.
const readSubmissions: Access = ({ req: { user } }) => {
  if (user?.role === 'super-admin' || user?.role === 'admin') return true
  if (user?.role === 'welfare-team') return { formType: { equals: 'welfare' } }
  return false
}

type MinistryRef = { name?: string | null; messageEmail?: string | null; contactEmail?: string | null }

// The ministry a message was sent to: already loaded, or looked up by its id.
async function ministryOf(doc: Record<string, unknown>, req: PayloadRequest): Promise<MinistryRef | null> {
  const m = doc.interestedMinistry
  if (m && typeof m === 'object') return m as MinistryRef
  if (!m) return null
  return req.payload.findByID({ collection: 'ministries', id: m as number, depth: 0, req }).catch(() => null)
}

/** The plain-text body of the email sent when someone submits a form. */
async function describeSubmission(doc: Record<string, unknown>, req: PayloadRequest): Promise<string> {
  const group = doc.interestedHomegroup
  let groupName: string | null = null
  if (group && typeof group === 'object' && 'area' in group) {
    groupName = String((group as { area: unknown }).area)
  } else if (group) {
    const found = await req.payload
      .findByID({ collection: 'homegroups', id: group as number, depth: 0, req })
      .catch(() => null)
    groupName = found?.area ?? `homegroup #${String(group)}`
  }

  if (doc.formType === 'welfare') {
    // Nothing about the person or what they wrote goes in the email; the team signs in to read it.
    const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL)?.replace(/\/$/, '')
    return `A new welfare request has come in through the website.\n\nFor privacy, this email does not include the person's name, contact details or what they wrote. ${
      base ? `Please sign in to read it: ${base}/admin/collections/form-submissions/${doc.id}` : 'Please sign in to the website admin and open Form submissions to read it.'
    }`
  }

  if (doc.formType === 'ministry-message') {
    const ministry = await ministryOf(doc, req)
    const contact = [doc.email, doc.phone].filter(Boolean).join(', ')
    return `${doc.name} (${contact}) sent a message to the ${ministry?.name ?? 'ministry'} team through the website:\n\n${doc.message || '(no message)'}\n\nReply to them directly using the details above.`
  }

  if (doc.formType === 'first-timer') {
    const intents = Array.isArray(doc.intents) ? doc.intents.map((i) => labelFor(VISITOR_INTENTS, i) ?? String(i)) : []
    const contact = labelFor(CONTACT_PREFERENCES, doc.contactPreference)
    // The questions are named as on the church's "New Member" Google Form, in the same order.
    const lines: [string, string | undefined][] = [
      ['Name', doc.name as string],
      ['Date of First Visit', dateOnly(doc.visitDate)],
      ['Church visited', doc.campus as string],
      ['Phone Number', doc.phone as string],
      ['Email Address', doc.email as string],
      ['Address', doc.address as string],
      ['Post Code', doc.postcode as string],
      ['City', doc.city as string],
      ['Country', doc.country as string],
      ['Home group', groupName ?? undefined],
      ['Can we Contact You?', doc.contactOther ? `${contact}: ${doc.contactOther}` : contact],
      ['How did you hear about us', doc.howHeardOther ? `${doc.howHeard}: ${doc.howHeardOther}` : (doc.howHeard as string)],
      ['Newsletter', doc.newsletterOptIn ? 'Yes' : undefined],
      ['Prayer request', doc.message as string],
      ['Please select the one applicable to you', labelFor(VISITOR_TYPES, doc.visitorType)],
      ['Please select from the following that applies to you', intents.length ? intents.join('; ') : undefined],
    ]
    const details = lines
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n')
    return `A first-time visitor filled in the website form:\n\n${details}`
  }

  if (doc.formType === 'book-order') {
    const qty = Number(doc.quantity) || 1
    const item = doc.bookTitle
      ? await req.payload.find({ collection: 'bookstore-items', where: { title: { equals: doc.bookTitle as string } }, limit: 1, depth: 0, req }).then((r) => r.docs[0]).catch(() => null)
      : null
    const total = totalDisplay(item?.priceDisplay, qty)
    const lines: [string, string | undefined][] = [
      ['Name', doc.name as string],
      ['Email', doc.email as string],
      ['Phone', doc.phone as string],
      ['Book', `${qty} x ${doc.bookTitle}${item?.priceDisplay ? ` (${item.priceDisplay} each${total ? `, ${total} in total` : ''})` : ''}`],
    ]
    const details = lines
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n')
    return `A book was ordered through the website, to be collected at church. Please contact them when it is ready.\n\n${details}${doc.message ? `\n\nNotes: ${doc.message}` : ''}`
  }

  if (doc.formType === 'reference-letter') {
    const lines: [string, string | undefined][] = [
      ['Name', doc.name as string],
      ['Email', doc.email as string],
      ['Phone', doc.phone as string],
      ['Letter type', labelFor(LETTER_TYPES, doc.letterType)],
      ['Purpose', doc.purpose as string],
      ['Required by', dateOnly(doc.requiredByDate)],
    ]
    const details = lines
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n')
    return `A letter was requested through the website:\n\n${details}${doc.message ? `\n\n${doc.message}` : ''}`
  }

  const contact = [doc.email, doc.phone].filter(Boolean).join(', ')
  return `${doc.name || 'Someone (anonymous)'}${contact ? ` (${contact})` : ''} submitted a ${doc.formType} form${groupName ? ` for ${groupName}` : ''}:\n\n${doc.message || '(no message)'}`
}

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    group: 'People & Enquiries',
    useAsTitle: 'name',
    defaultColumns: ['name', 'formType', 'createdAt'],
  },
  hooks: {
    afterChange: [
      notifyOnSubmission(
        async (doc, req) => {
          // The church is in the subject so each branch's team can see at a glance which church it is for.
          if (doc.formType === 'first-timer') return doc.campus ? `New first-time visitor (${doc.campus})` : 'New first-time visitor'
          if (doc.formType === 'welfare') return 'New welfare request'
          if (doc.formType === 'ministry-message') return `New message for ${(await ministryOf(doc, req))?.name ?? 'a ministry team'}`
          if (doc.formType === 'book-order') return `New book order: ${doc.bookTitle ?? 'a book'}`
          // A school letter keeps the subject the church office already uses for these, so it is easy to spot.
          if (doc.formType === 'reference-letter') return doc.letterType === 'school' ? 'LETTER FOR SCHOOL' : 'New letter request'
          return 'New Website Enquiry'
        },
        describeSubmission,
        // First-time visitors go to the welcome team of the church they visited, a message to the ministry's own
        // contact (its private message address first), and everything else to NOTIFY_EMAIL.
        async (doc, req) => {
          if (doc.formType === 'ministry-message') {
            const ministry = await ministryOf(doc, req)
            return ministry?.messageEmail?.trim() || ministry?.contactEmail?.trim() || process.env.NOTIFY_EMAIL
          }
          if (doc.formType === 'welfare') {
            const settings = await req.payload.findGlobal({ slug: 'settings', depth: 0, req }).catch(() => null)
            return settings?.formEmails?.welfare?.trim() || process.env.NOTIFY_EMAIL
          }
          if (doc.formType !== 'first-timer') return process.env.NOTIFY_EMAIL
          const settings = await req.payload.findGlobal({ slug: 'settings', depth: 0, req }).catch(() => null)
          return firstTimerRecipient(doc.campus as string | undefined, settings)
        },
      ),
    ],
  },
  access: {
    // Covers Contact, Appointment, and Membership enquiries under one
    // collection (discriminated by formType) — all three share the same
    // privacy rules, so splitting them into separate collections would
    // just add admin-sidebar clutter without changing access behavior.
    create: publicCreateOnly,
    read: readSubmissions,
    update: pastoralReadOnly,
    delete: pastoralReadOnly,
  },
  fields: [
    {
      name: 'formType',
      type: 'select',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Appointment Request', value: 'appointment' },
        { label: 'Membership', value: 'membership' },
        { label: 'Reference Letter Request', value: 'reference-letter' },
        { label: 'Welfare & Support Request', value: 'welfare' },
        { label: 'Step of Faith', value: 'step-of-faith' },
        { label: 'Join a Homegroup', value: 'homegroup-join' },
        { label: 'First-Time Visitor', value: 'first-timer' },
        { label: 'Mission Trip / Volunteer Sign-Up', value: 'mission-trip' },
        { label: 'Campus Connection (relocating student)', value: 'campus-connect' },
        { label: 'Message to a Ministry Team', value: 'ministry-message' },
        { label: 'Book Order (collect at church)', value: 'book-order' },
      ],
    },
    {
      name: 'name',
      type: 'text',
      // Step of Faith used to allow an anonymous response, so older records can have no name. A new one needs it
      // (the form now makes name, email and phone compulsory); only an existing record may be saved without.
      validate: (value: unknown, { siblingData, operation }: { siblingData?: { formType?: string }; operation?: string }) => {
        if (siblingData?.formType === 'step-of-faith' && operation !== 'create') return true
        return value ? true : 'Name is required.'
      },
    },
    {
      name: 'email',
      type: 'text',
      // Optional for Join a Homegroup (phone is the required way to reach them there instead). A new Step of Faith or
      // First-Time Visitor record needs both an email and a phone number; older ones (which could be anonymous, or have
      // only one) can still be saved as they are.
      validate: (value: unknown, { siblingData, operation }: { siblingData?: { formType?: string }; operation?: string }) => {
        if (siblingData?.formType === 'homegroup-join') return true
        if ((siblingData?.formType === 'step-of-faith' || siblingData?.formType === 'first-timer') && operation !== 'create') return true
        return value ? true : 'Email is required.'
      },
    },
    {
      name: 'phone',
      type: 'text',
      validate: (value: unknown, { siblingData, operation }: { siblingData?: { formType?: string }; operation?: string }) => {
        if (siblingData?.formType === 'homegroup-join') return value ? true : 'Phone number is required.'
        if ((siblingData?.formType === 'step-of-faith' || siblingData?.formType === 'first-timer') && operation === 'create') {
          return value ? true : 'Phone number is required.'
        }
        return true
      },
    },
    { name: 'preferredDate', type: 'date', admin: { condition: (data) => data.formType === 'appointment' } },
    { name: 'bookTitle', type: 'text', label: 'Book ordered', admin: { condition: (data) => data.formType === 'book-order' } },
    { name: 'quantity', type: 'number', label: 'How many', min: 1, admin: { condition: (data) => data.formType === 'book-order' } },
    {
      name: 'interestedMinistry',
      type: 'relationship',
      relationTo: 'ministries',
      admin: {
        description: 'Which ministry they want to join, or sent a message to.',
        condition: (data) => data.formType === 'membership' || data.formType === 'ministry-message',
      },
    },
    {
      name: 'interestedHomegroup',
      type: 'relationship',
      relationTo: 'homegroups',
      admin: {
        description: 'The homegroup they asked to join (or, for a first-time visitor, their home group). Empty means "not sure".',
        condition: (data) => data.formType === 'homegroup-join' || data.formType === 'first-timer',
      },
    },
    // ---- First-time visitor: the same questions as the church's New Member form ----
    { name: 'visitDate', type: 'date', label: 'Date of First Visit', admin: { date: { pickerAppearance: 'dayOnly' }, condition: (data) => data.formType === 'first-timer' } },
    { name: 'address', type: 'text', admin: { condition: (data) => data.formType === 'first-timer' } },
    { name: 'postcode', type: 'text', label: 'Post Code', admin: { condition: (data) => data.formType === 'first-timer' } },
    { name: 'city', type: 'text', admin: { condition: (data) => data.formType === 'first-timer' } },
    { name: 'country', type: 'text', admin: { condition: (data) => data.formType === 'first-timer' } },
    { name: 'howHeard', type: 'text', label: 'How did you hear about us', admin: { condition: (data) => data.formType === 'first-timer' } },
    {
      name: 'howHeardOther',
      type: 'text',
      label: 'How did you hear about us (Other)',
      admin: { condition: (data) => data.formType === 'first-timer' && data.howHeard === 'Other' },
    },
    {
      name: 'visitorType',
      type: 'select',
      label: 'Please select the one applicable to you',
      options: [
        { label: 'Student', value: 'student' },
        { label: 'Working Professional', value: 'working-professional' },
        { label: 'Visitor', value: 'visitor' },
        { label: 'Others', value: 'other' },
      ],
      admin: { condition: (data) => data.formType === 'first-timer' },
    },
    {
      name: 'intents',
      type: 'select',
      hasMany: true,
      label: 'Please select from the following that applies to you',
      options: [
        { label: 'I want to Accept Jesus as my Lord and Saviour', value: 'accept-jesus' },
        { label: 'I want to be a member', value: 'membership' },
        { label: 'I want to join a department in church', value: 'join-department' },
      ],
      admin: { condition: (data) => data.formType === 'first-timer' },
    },
    {
      name: 'contactPreference',
      type: 'select',
      label: 'Can we Contact You?',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Other', value: 'other' },
      ],
      admin: { condition: (data) => data.formType === 'first-timer' },
    },
    {
      name: 'contactOther',
      type: 'text',
      label: 'Can we Contact You? (Other)',
      admin: { condition: (data) => data.formType === 'first-timer' && data.contactPreference === 'other' },
    },
    { name: 'newsletterOptIn', type: 'checkbox', label: 'Newsletter', admin: { condition: (data) => data.formType === 'first-timer' } },
    {
      name: 'interestedProject',
      type: 'relationship',
      relationTo: 'mission-projects',
      admin: {
        description: 'The mission project they are interested in (if they chose one).',
        condition: (data) => data.formType === 'mission-trip',
      },
    },
    {
      name: 'campus',
      type: 'text',
      admin: {
        description: 'First-timer: the campus they attended. Campus connection: the campus they want to connect with.',
        condition: (data) => data.formType === 'first-timer' || data.formType === 'campus-connect',
      },
    },
    {
      name: 'serviceAttended',
      type: 'text',
      admin: {
        description: 'Which service they attended.',
        condition: (data) => data.formType === 'first-timer',
      },
    },
    {
      name: 'letterType',
      type: 'select',
      options: LETTER_TYPES.map((t) => ({ label: t.label, value: t.value })),
      admin: { condition: (data) => data.formType === 'reference-letter' },
    },
    {
      name: 'purpose',
      type: 'text',
      admin: {
        description: 'What the reference letter is for.',
        condition: (data) => data.formType === 'reference-letter',
      },
    },
    {
      name: 'requiredByDate',
      type: 'date',
      admin: { condition: (data) => data.formType === 'reference-letter' },
    },
    {
      name: 'supportType',
      type: 'select',
      options: [
        { label: 'Financial', value: 'financial' },
        { label: 'Counselling', value: 'counselling' },
        { label: 'Food / Practical Needs', value: 'food' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'What kind of support they need.',
        condition: (data) => data.formType === 'welfare',
      },
    },
    {
      name: 'decisionType',
      type: 'select',
      options: [
        { label: "I'm trusting Jesus for the first time", value: 'first-time' },
        { label: "I'm recommitting my life to Christ", value: 'recommitting' },
        { label: 'I want to learn more before deciding', value: 'learn-more' },
      ],
      admin: { condition: (data) => data.formType === 'step-of-faith' },
    },
    { name: 'message', type: 'textarea' },
  ],
}
