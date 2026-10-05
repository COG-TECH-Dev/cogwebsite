import type { CollectionSlug } from 'payload'

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

export type ExportConfig = {
  label: string
  collection: CollectionSlug
  columns: [header: string, get: (doc: Row) => unknown][]
}

/**
 * Every collection that holds data submitted through a form on the site, and
 * the columns to export for each. Used by both the download route
 * (/api/data-export) and the admin dashboard panel's dropdown, so the two
 * can't drift apart.
 */
export const DATA_EXPORTS: Record<string, ExportConfig> = {
  'form-submissions': {
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
}
