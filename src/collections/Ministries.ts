import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp, isMinistryLeaderOfDoc } from '../access'

export const Ministries: CollectionConfig = {
  slug: 'ministries',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'featured'],
  },
  access: {
    read: () => true,
    create: isContentEditorOrUp,
    // Content Editor+ can update any ministry; a Ministry Leader can only
    // update the ministry/ministries assigned to them on their user record.
    update: isMinistryLeaderOfDoc('id'),
    delete: isContentEditorOrUp,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'summary', type: 'textarea' },
    { name: 'description', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'leaderName', type: 'text' },
    {
      name: 'meetingTimes',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'time', type: 'text', required: true },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
}
