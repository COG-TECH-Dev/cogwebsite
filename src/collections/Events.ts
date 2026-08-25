import type { CollectionConfig } from 'payload'

import { isMinistryLeaderOfDoc } from '../access'
import { restrictPublishToContentEditor } from '../hooks/restrictPublishToContentEditor'

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
  },
  access: {
    read: () => true,
    // Any signed-in staff/volunteer can propose an event; Content Editor+
    // can publish, Ministry Leaders publish within their own scope, and a
    // Volunteer's submission is force-kept as a draft (see the hook above).
    create: ({ req: { user } }) => Boolean(user),
    update: isMinistryLeaderOfDoc('relatedMinistry'),
    delete: isMinistryLeaderOfDoc('relatedMinistry'),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
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
    { name: 'location', type: 'text' },
    { name: 'description', type: 'richText' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'relatedMinistry', type: 'relationship', relationTo: 'ministries' },
    { name: 'externalRegistrationLink', type: 'text' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
}
