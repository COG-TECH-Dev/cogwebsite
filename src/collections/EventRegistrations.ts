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
    defaultColumns: ['name', 'event', 'guests', 'createdAt'],
  },
  hooks: {
    beforeChange: [enforceEventCapacity],
    afterChange: [
      // Refreshes the event page's cached "spots left" count immediately
      // instead of waiting out the 60s ISR window.
      revalidateCollection(paths),
      notifyOnSubmission(
        'New Event RSVP',
        (doc) => `${doc.name} (${doc.email}) registered for an upcoming event — ${doc.guests} attending.`,
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
      name: 'guests',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
      admin: { description: 'Total number of people this registration covers, including the registrant.' },
    },
  ],
}
