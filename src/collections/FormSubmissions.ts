import type { CollectionConfig, PayloadRequest } from 'payload'

import { pastoralReadOnly, publicCreateOnly } from '../access'
import { notifyOnSubmission } from '../hooks/notifyOnSubmission'
import { CONTACT_PREFERENCES, DEFAULT_FIRST_TIMER_EMAIL, VISITOR_INTENTS, VISITOR_TYPES, labelFor } from '../lib/firstTimer'

const dateOnly = (value: unknown) => (value ? new Date(String(value)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined)

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

  if (doc.formType === 'ministry-message') {
    const ministry = await ministryOf(doc, req)
    const contact = [doc.email, doc.phone].filter(Boolean).join(', ')
    return `${doc.name} (${contact}) sent a message to the ${ministry?.name ?? 'ministry'} team through the website:\n\n${doc.message || '(no message)'}\n\nReply to them directly using the details above.`
  }

  if (doc.formType === 'first-timer') {
    const intents = Array.isArray(doc.intents) ? doc.intents.map((i) => labelFor(VISITOR_INTENTS, i) ?? String(i)) : []
    const address = [doc.address, doc.city, doc.postcode, doc.country].filter(Boolean).join(', ')
    const lines: [string, string | undefined][] = [
      ['Name', doc.name as string],
      ['Email', doc.email as string],
      ['Phone', doc.phone as string],
      ['Date of first visit', dateOnly(doc.visitDate)],
      ['Church / campus', doc.campus as string],
      ['Service attended', doc.serviceAttended as string],
      ['Address', address || undefined],
      ['Home group', groupName ?? undefined],
      ['Can we contact them?', labelFor(CONTACT_PREFERENCES, doc.contactPreference)],
      ['How they heard about us', doc.howHeard as string],
      ['They are a', labelFor(VISITOR_TYPES, doc.visitorType)],
      ['Would like to', intents.length ? intents.join('; ') : undefined],
      ['Wants the newsletter', doc.newsletterOptIn ? 'Yes' : undefined],
      ['Prayer request / message', doc.message as string],
    ]
    const details = lines
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n')
    return `A first-time visitor filled in the website form:\n\n${details}`
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
          if (doc.formType === 'first-timer') return 'New first-time visitor'
          if (doc.formType === 'ministry-message') return `New message for ${(await ministryOf(doc, req))?.name ?? 'a ministry team'}`
          return 'New Website Enquiry'
        },
        describeSubmission,
        // First-time visitors go to the church's welcome team, a message to the ministry's own
        // contact (its private message address first), and everything else to NOTIFY_EMAIL.
        async (doc, req) => {
          if (doc.formType === 'ministry-message') {
            const ministry = await ministryOf(doc, req)
            return ministry?.messageEmail?.trim() || ministry?.contactEmail?.trim() || process.env.NOTIFY_EMAIL
          }
          if (doc.formType !== 'first-timer') return process.env.NOTIFY_EMAIL
          const settings = await req.payload.findGlobal({ slug: 'settings', depth: 0, req }).catch(() => null)
          return settings?.formEmails?.firstTimer?.trim() || DEFAULT_FIRST_TIMER_EMAIL
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
    read: pastoralReadOnly,
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
      ],
    },
    {
      name: 'name',
      type: 'text',
      // Optional only for Step of Faith — that form explicitly lets someone
      // respond anonymously and still see their next steps (matches the
      // church's existing wording for this flow).
      validate: (value: unknown, { siblingData }: { siblingData?: { formType?: string } }) => {
        if (siblingData?.formType === 'step-of-faith') return true
        return value ? true : 'Name is required.'
      },
    },
    {
      name: 'email',
      type: 'text',
      // Optional for Step of Faith (anonymous allowed) and Join a Homegroup
      // (phone is the required way to reach them there instead).
      validate: (value: unknown, { siblingData }: { siblingData?: { formType?: string; phone?: string } }) => {
        if (siblingData?.formType === 'step-of-faith' || siblingData?.formType === 'homegroup-join') return true
        // A first-time visitor can give either an email or a phone number.
        if (siblingData?.formType === 'first-timer') return value || siblingData.phone ? true : 'Please give an email or phone number.'
        return value ? true : 'Email is required.'
      },
    },
    {
      name: 'phone',
      type: 'text',
      validate: (value: unknown, { siblingData }: { siblingData?: { formType?: string } }) => {
        if (siblingData?.formType === 'homegroup-join') return value ? true : 'Phone number is required.'
        return true
      },
    },
    { name: 'preferredDate', type: 'date', admin: { condition: (data) => data.formType === 'appointment' } },
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
    { name: 'visitDate', type: 'date', label: 'Date of first visit', admin: { date: { pickerAppearance: 'dayOnly' }, condition: (data) => data.formType === 'first-timer' } },
    { name: 'address', type: 'text', admin: { condition: (data) => data.formType === 'first-timer' } },
    { name: 'postcode', type: 'text', label: 'Post code', admin: { condition: (data) => data.formType === 'first-timer' } },
    { name: 'city', type: 'text', admin: { condition: (data) => data.formType === 'first-timer' } },
    { name: 'country', type: 'text', admin: { condition: (data) => data.formType === 'first-timer' } },
    { name: 'howHeard', type: 'text', label: 'How did they hear about us?', admin: { condition: (data) => data.formType === 'first-timer' } },
    {
      name: 'visitorType',
      type: 'select',
      label: 'They are a…',
      options: [
        { label: 'Student', value: 'student' },
        { label: 'Working professional', value: 'working-professional' },
        { label: 'Visitor', value: 'visitor' },
        { label: 'Other', value: 'other' },
      ],
      admin: { condition: (data) => data.formType === 'first-timer' },
    },
    {
      name: 'intents',
      type: 'select',
      hasMany: true,
      label: 'They would like to…',
      options: [
        { label: 'Accept Jesus as their Lord and Saviour', value: 'accept-jesus' },
        { label: 'Become a member', value: 'membership' },
        { label: 'Join a department in church', value: 'join-department' },
      ],
      admin: { condition: (data) => data.formType === 'first-timer' },
    },
    {
      name: 'contactPreference',
      type: 'select',
      label: 'Can we contact them?',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Other', value: 'other' },
      ],
      admin: { condition: (data) => data.formType === 'first-timer' },
    },
    { name: 'newsletterOptIn', type: 'checkbox', label: 'Wants the church newsletter', admin: { condition: (data) => data.formType === 'first-timer' } },
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
      options: [
        { label: 'Character Reference', value: 'character' },
        { label: 'Membership Confirmation', value: 'membership-confirmation' },
        { label: 'Financial Reference', value: 'financial' },
        { label: 'Other', value: 'other' },
      ],
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
