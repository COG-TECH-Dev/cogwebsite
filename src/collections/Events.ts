import type { CollectionConfig } from 'payload'

import { isMinistryLeaderOfDoc, readPublishedOrStaff } from '../access'
import { formatSlug } from '../hooks/formatSlug'
import { restrictPublishToContentEditor } from '../hooks/restrictPublishToContentEditor'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'

const paths = (doc: Record<string, unknown>) => ['/', '/programmes', `/programmes/${doc.slug}`]

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'startDate', 'featured'],
  },
  versions: { drafts: true },
  hooks: {
    beforeChange: [restrictPublishToContentEditor],
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionOnDelete(paths)],
  },
  access: {
    read: readPublishedOrStaff,
    // Any signed-in staff/volunteer can propose an event; Content Editor+
    // can publish, Ministry Leaders publish within their own scope, and a
    // Volunteer's submission is force-kept as a draft (see the hook above).
    create: ({ req: { user } }) => Boolean(user),
    update: isMinistryLeaderOfDoc('relatedMinistry'),
    delete: isMinistryLeaderOfDoc('relatedMinistry'),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Auto-generated from the title if left blank. Used in the page URL.' },
      hooks: { beforeValidate: [formatSlug('title')] },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'programme',
      options: [
        { label: 'Programme', value: 'programme' },
        { label: 'Conference', value: 'conference' },
        { label: 'Mission', value: 'mission' },
        { label: 'Regular', value: 'regular' },
      ],
    },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date' },
    {
      name: 'timeLabel',
      type: 'text',
      label: 'Time',
      admin: { description: 'Typed as you want it shown, e.g. "10:00am – 4:00pm" or "Fridays, 7pm". Shown on the events list and the event page.' },
    },
    { name: 'location', type: 'text' },
    { name: 'description', type: 'richText' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'relatedMinistry', type: 'relationship', relationTo: 'ministries' },
    { name: 'externalRegistrationLink', type: 'text' },
    {
      name: 'registrationEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Let people RSVP for this event directly on the site.' },
    },
    {
      name: 'volunteerEnabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Let people offer to volunteer',
      admin: {
        description: 'Adds a "volunteer" option to the sign-up box, for outreaches and other events that need helpers. Volunteers do not use up attendee places.',
      },
    },
    {
      name: 'capacity',
      type: 'number',
      min: 1,
      admin: {
        description: 'Maximum total attendees. Leave blank for unlimited.',
        condition: (data) => data.registrationEnabled,
      },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
}
