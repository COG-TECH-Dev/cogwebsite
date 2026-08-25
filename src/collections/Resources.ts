import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp } from '../access'

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'type'],
  },
  access: {
    read: () => true,
    create: isContentEditorOrUp,
    update: isContentEditorOrUp,
    delete: isContentEditorOrUp,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Devotional', value: 'devotional' },
        { label: 'Bible Reading Plan', value: 'reading-plan' },
        { label: 'Topical Guide', value: 'topical-guide' },
      ],
    },
    { name: 'body', type: 'richText' },
    { name: 'file', type: 'upload', relationTo: 'media' },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
  ],
}
