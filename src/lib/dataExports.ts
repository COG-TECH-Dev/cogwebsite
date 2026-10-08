import type { CollectionSlug, Payload, Where } from 'payload'

import { MINISTRY_CATEGORIES, ministryCategory } from './ministryCategories'

type Row = Record<string, unknown>

// What a relationship cell shows: the related document's name/title when
// it's been populated (depth 1), otherwise just its id.
function rel(value: unknown): unknown {
  if (value && typeof value === 'object') {
    const v = value as Row
    return v.name ?? v.title ?? v.id ?? ''
  }
  return value
}

/** The optional date range chosen in the picker, as "YYYY-MM-DD". */
export type ExportRange = { from?: string; to?: string }

/** The conditions that keep a collection's rows inside the range, on the chosen date field. */
export function rangeConditions(range: ExportRange, field = 'createdAt'): Where[] {
  const out: Where[] = []
  if (range.from) out.push({ [field]: { greater_than_equal: `${range.from}T00:00:00.000Z` } })
  if (range.to) out.push({ [field]: { less_than_equal: `${range.to}T23:59:59.999Z` } })
  return out
}

export type ExportConfig = {
  label: string
  collection: CollectionSlug
  columns: [header: string, get: (doc: Row) => unknown][]
  /** Where it is listed in the picker. */
  group?: 'Submitted through the site' | 'Summaries for analysis'
  /** The date field the from/to range applies to (default: when the row was created). */
  dateField?: string
  sort?: string
  /** A summary: every row is listed whatever the dates, and the dates narrow the counts instead. */
  summary?: boolean
  /** Adds counts from other collections to each row, ready for the columns to read. */
  enrich?: (docs: Row[], payload: Payload, range: ExportRange) => Promise<Row[]>
}

// The id of a related document, whether it came back as an id or as the populated document.
const relId = (value: unknown): number | null => {
  if (value && typeof value === 'object') return Number((value as Row).id) || null
  return typeof value === 'number' ? value : null
}

// How many times each id appears, for rows pointing at one document.
const countBy = (docs: Row[], key: string, pick: (d: Row) => boolean = () => true) => {
  const out = new Map<number, number>()
  for (const d of docs) {
    const id = relId(d[key])
    if (id && pick(d)) out.set(id, (out.get(id) ?? 0) + 1)
  }
  return out
}

/**
 * Every collection that holds data submitted through a form on the site, and
 * the columns to export for each. Used by both the download route
 * (/api/data-export) and the admin dashboard panel's dropdown, so the two
 * can't drift apart.
 */
export const DATA_EXPORTS: Record<string, ExportConfig> = {
  'form-submissions': {
    group: 'Submitted through the site',
    label: 'Enquiries & sign-ups (contact, appointments, membership, reference letters, welfare, step of faith, homegroups, first-time visitors, mission trips, campus connections)',
    collection: 'form-submissions',
    columns: [
      ['ID', (d) => d.id],
      ['Submitted', (d) => d.createdAt],
      ['Form', (d) => d.formType],
      ['Name', (d) => d.name],
      ['Email', (d) => d.email],
      ['Phone', (d) => d.phone],
      ['Ministry', (d) => rel(d.interestedMinistry)],
      ['Homegroup', (d) => rel(d.interestedHomegroup)],
      ['Mission Project', (d) => rel(d.interestedProject)],
      ['Campus', (d) => d.campus],
      ['Service Attended', (d) => d.serviceAttended],
      ['Date of First Visit', (d) => d.visitDate],
      ['Address', (d) => d.address],
      ['City', (d) => d.city],
      ['Post Code', (d) => d.postcode],
      ['Country', (d) => d.country],
      ['Can We Contact Them', (d) => d.contactPreference],
      ['How They Heard About Us', (d) => d.howHeard],
      ['They Are A', (d) => d.visitorType],
      ['Would Like To', (d) => (Array.isArray(d.intents) ? d.intents.join('; ') : '')],
      ['Wants Newsletter', (d) => (d.newsletterOptIn ? 'Yes' : '')],
      ['Preferred Date', (d) => d.preferredDate],
      ['Letter Type', (d) => d.letterType],
      ['Purpose', (d) => d.purpose],
      ['Required By', (d) => d.requiredByDate],
      ['Support Type', (d) => d.supportType],
      ['Decision', (d) => d.decisionType],
      ['Message', (d) => d.message],
    ],
  },
  'prayer-requests': {
    group: 'Submitted through the site',
    label: 'Prayer requests',
    collection: 'prayer-requests',
    columns: [
      ['ID', (d) => d.id],
      ['Submitted', (d) => d.createdAt],
      ['Name', (d) => d.name],
      ['Email', (d) => d.email],
      ['Phone', (d) => d.phone],
      ['Request', (d) => d.request],
      // Requests from before the three-way choice default to Private (the safe side).
      ['Who May See It', (d) => d.visibility ?? 'private'],
      ['Approved For Prayer Wall', (d) => (d.visibility === 'public' ? (d.approved ? 'Yes' : 'No') : '')],
      ['Status', (d) => d.status],
    ],
  },
  'child-safeguarding-forms': {
    group: 'Submitted through the site',
    label: "Children's ministry forms (photo consent, volunteer interest, pre-registration)",
    collection: 'child-safeguarding-forms',
    columns: [
      ['ID', (d) => d.id],
      ['Submitted', (d) => d.createdAt],
      ['Form', (d) => d.formType],
      ['Parent Name', (d) => d.parentName],
      ['Parent Email', (d) => d.parentEmail],
      ['Parent Phone', (d) => d.parentPhone],
      ['Child Name', (d) => d.childName],
      ['Child Date of Birth', (d) => d.childDOB],
      ['Photo Consent', (d) => d.photoConsent],
      ['Allergies / Medical Notes', (d) => d.allergiesOrMedicalNotes],
      ['Additional Needs', (d) => d.additionalNeeds],
      ['Authorised Collectors', (d) => d.authorisedCollectors],
      ['Medical Treatment Consent', (d) => (d.medicalTreatmentConsent ? 'Yes' : 'No')],
      ['Emergency Contact', (d) => d.emergencyContactName],
      ['Emergency Phone', (d) => d.emergencyContactPhone],
      ['Availability', (d) => d.availability],
      ['Vetting Acknowledged', (d) => (d.vettingAcknowledged ? 'Yes' : 'No')],
      ['Message', (d) => d.message],
      ['Status', (d) => d.status],
    ],
  },
  'event-registrations': {
    group: 'Submitted through the site',
    label: 'Event registrations',
    collection: 'event-registrations',
    columns: [
      ['ID', (d) => d.id],
      ['Registered', (d) => d.createdAt],
      ['Event', (d) => rel(d.event)],
      ['Name', (d) => d.name],
      ['Email', (d) => d.email],
      ['Phone', (d) => d.phone],
      ['Attending Or Volunteering', (d) => d.role ?? 'attendee'],
      ['Guests', (d) => d.guests],
      ['How They Would Like To Help', (d) => d.notes],
    ],
  },
  testimonials: {
    group: 'Submitted through the site',
    label: 'Testimonies',
    collection: 'testimonials',
    columns: [
      ['ID', (d) => d.id],
      ['Submitted', (d) => d.createdAt],
      ['Name', (d) => d.name],
      ['Contact Email', (d) => d.submitterEmail],
      ['Ministry', (d) => rel(d.relatedMinistry)],
      ['Testimony', (d) => d.quote],
      ['Status', (d) => d.status],
      ['Featured', (d) => (d.featured ? 'Yes' : 'No')],
    ],
  },
  donations: {
    group: 'Submitted through the site',
    label: 'Donations (online giving, including Gift Aid details)',
    collection: 'donations',
    columns: [
      ['ID', (d) => d.id],
      ['Started', (d) => d.createdAt],
      ['Paid', (d) => d.paidAt],
      ['Donor Name', (d) => d.donorName],
      ['Donor Email', (d) => d.donorEmail],
      ['Amount (GBP)', (d) => (typeof d.amount === 'number' ? (d.amount / 100).toFixed(2) : '')],
      ['Branch', (d) => d.branch],
      ['Fund', (d) => d.fund],
      ['Frequency', (d) => d.frequency],
      ['Chosen Start Date', (d) => d.startDate],
      ['Status', (d) => d.status],
      ['Gift Aid Declared', (d) => ((d.giftAid as Row | undefined)?.declared ? 'Yes' : 'No')],
      ['Gift Aid Address', (d) => (d.giftAid as Row | undefined)?.address],
      ['Gift Aid Postcode', (d) => (d.giftAid as Row | undefined)?.postcode],
    ],
  },
  // ---- Summaries built for analysis: one row per event / ministry / homegroup, with counts alongside ----
  events: {
    group: 'Summaries for analysis',
    label: 'Events and attendance (one row per event, with RSVPs, volunteers and how full it was)',
    collection: 'events',
    dateField: 'startDate',
    sort: '-startDate',
    enrich: async (docs, payload) => {
      const regs = await payload.find({ collection: 'event-registrations', pagination: false, depth: 0, select: { event: true, role: true, guests: true } })
      const by = new Map<number, { registrations: number; attendees: number; volunteers: number }>()
      for (const r of regs.docs as unknown as Row[]) {
        const id = relId(r.event)
        if (!id) continue
        const t = by.get(id) ?? { registrations: 0, attendees: 0, volunteers: 0 }
        t.registrations += 1
        if (r.role === 'volunteer') t.volunteers += 1
        else t.attendees += typeof r.guests === 'number' ? r.guests : 1
        by.set(id, t)
      }
      return docs.map((d) => ({ ...d, _totals: by.get(Number(d.id)) ?? { registrations: 0, attendees: 0, volunteers: 0 } }))
    },
    columns: [
      ['ID', (d) => d.id],
      ['Event', (d) => d.title],
      ['Type', (d) => d.type],
      ['Published', (d) => (d._status === 'published' ? 'Yes' : 'No')],
      ['Starts', (d) => String(d.startDate ?? '').slice(0, 10)],
      ['Ends', (d) => String(d.endDate ?? d.startDate ?? '').slice(0, 10)],
      ['Time', (d) => d.timeLabel],
      ['Location', (d) => d.location],
      ['Hosted By', (d) => rel(d.relatedMinistry)],
      ['RSVP On', (d) => (d.registrationEnabled ? 'Yes' : 'No')],
      ['Volunteers On', (d) => (d.volunteerEnabled ? 'Yes' : 'No')],
      ['Capacity', (d) => d.capacity],
      ['Sign-Ups', (d) => (d._totals as Row).registrations],
      ['People Attending (with guests)', (d) => (d._totals as Row).attendees],
      ['Volunteers', (d) => (d._totals as Row).volunteers],
      [
        'Places Filled (%)',
        (d) => (typeof d.capacity === 'number' && d.capacity > 0 ? Math.round(((d._totals as Row).attendees as number / d.capacity) * 100) : ''),
      ],
    ],
  },
  ministries: {
    group: 'Summaries for analysis',
    label: 'Ministries (one row per ministry, with sign-ups and messages in the dates chosen)',
    collection: 'ministries',
    sort: 'name',
    summary: true,
    enrich: async (docs, payload, range) => {
      const subs = await payload.find({
        collection: 'form-submissions',
        where: { and: [{ formType: { in: ['membership', 'ministry-message'] } }, ...rangeConditions(range)] },
        pagination: false,
        depth: 0,
        select: { formType: true, interestedMinistry: true },
      })
      const rows = subs.docs as unknown as Row[]
      const signups = countBy(rows, 'interestedMinistry', (d) => d.formType === 'membership')
      const messages = countBy(rows, 'interestedMinistry', (d) => d.formType === 'ministry-message')
      return docs.map((d) => ({ ...d, _signups: signups.get(Number(d.id)) ?? 0, _messages: messages.get(Number(d.id)) ?? 0 }))
    },
    columns: [
      ['ID', (d) => d.id],
      ['Ministry', (d) => d.name],
      ['Group', (d) => MINISTRY_CATEGORIES.find((c) => c.value === ministryCategory({ name: String(d.name ?? ''), category: d.category as string | null }))?.label ?? ''],
      ['Leader', (d) => d.leaderName],
      ['Has Meeting Times', (d) => (Array.isArray(d.meetingTimes) && d.meetingTimes.length > 0 ? 'Yes' : 'No')],
      ['Sign-Up Requests', (d) => d._signups],
      ['Messages To The Team', (d) => d._messages],
    ],
  },
  homegroups: {
    group: 'Summaries for analysis',
    label: 'Homegroups (one row per group, with requests to join in the dates chosen)',
    collection: 'homegroups',
    sort: 'area',
    summary: true,
    enrich: async (docs, payload, range) => {
      const subs = await payload.find({
        collection: 'form-submissions',
        where: { and: [{ formType: { in: ['homegroup-join', 'first-timer'] } }, ...rangeConditions(range)] },
        pagination: false,
        depth: 0,
        select: { formType: true, interestedHomegroup: true },
      })
      const rows = subs.docs as unknown as Row[]
      const joins = countBy(rows, 'interestedHomegroup', (d) => d.formType === 'homegroup-join')
      const visitors = countBy(rows, 'interestedHomegroup', (d) => d.formType === 'first-timer')
      return docs.map((d) => ({ ...d, _joins: joins.get(Number(d.id)) ?? 0, _visitors: visitors.get(Number(d.id)) ?? 0 }))
    },
    columns: [
      ['ID', (d) => d.id],
      ['Area', (d) => d.area],
      ['Leader', (d) => d.leaderName],
      ['Meeting Day', (d) => d.meetingDay],
      ['Requests To Join', (d) => d._joins],
      ['First-Time Visitors Who Named It', (d) => d._visitors],
    ],
  },
}
