import type { CollectionConfig } from 'payload'

import { pastoralReadOnly, publicCreateOnly } from '../access'
import { enforceEventCapacity } from '../hooks/enforceEventCapacity'
import { notifyOnSubmission } from '../hooks/notifyOnSubmission'
import { revalidateCollection } from '../hooks/revalidate'

// Default local-API depth populates `event` as the full related doc, so its
// slug is usually available here without an extra query — falls back to
// revalidating the listing page if it ever comes back as a bare ID.
const paths = (doc: Record<string, unknown>) => {
  const event = doc.event
  if (event && typeof event === 'object' && 'slug' in event) {
    return [`/programmes/${(event as { slug: string }).slug}`]
  }
  return ['/programmes']
}

export const EventRegistrations: CollectionConfig = {
  slug: 'event-registrations',
  admin: {
    group: 'People & Enquiries',
    useAsTitle: 'name',
    defaultColumns: ['name', 'event', 'role', 'guests', 'createdAt'],
  },
  hooks: {
    beforeChange: [enforceEventCapacity],
    afterChange: [
      // Refreshes the event page's cached "spots left" count immediately
      // instead of waiting out the 60s ISR window.
      revalidateCollection(paths),
      notifyOnSubmission(
        (doc) => (doc.role === 'volunteer' ? 'New Event Volunteer' : 'New Event RSVP'),
        (doc) => {
          const event = doc.event && typeof doc.event === 'object' && 'title' in doc.event ? ` "${String((doc.event as { title: unknown }).title)}"` : ''
          const contact = [doc.email, doc.phone].filter(Boolean).join(', ')
          if (doc.role === 'volunteer') {
            return `${doc.name} (${contact}) offered to volunteer at the event${event}.\n\nHow they would like to help: ${doc.notes || '(not said)'}`
          }
          return `${doc.name} (${contact}) registered for the event${event} — ${doc.guests} attending.`
        },
      ),
    ],
  },
  access: {
    // Same confidentiality bar as other public enquiry forms — anyone can
    // RSVP, but only pastoral/admin staff can read the attendee list.
    create: publicCreateOnly,
    read: pastoralReadOnly,
    update: pastoralReadOnly,
    delete: pastoralReadOnly,
  },
  fields: [
    { name: 'event', type: 'relationship', relationTo: 'events', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'attendee',
      options: [
        { label: 'Attending', value: 'attendee' },
        { label: 'Volunteering', value: 'volunteer' },
      ],
      admin: { description: 'Volunteers do not count towards the event\'s attendee capacity.' },
    },
    { name: 'notes', type: 'textarea', admin: { description: 'For volunteers: how they would like to help.' } },
    {
      name: 'guests',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
      admin: { description: 'Total number of people this registration covers, including the registrant.' },
    },
  ],
}
