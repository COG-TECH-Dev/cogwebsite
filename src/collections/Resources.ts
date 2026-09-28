import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp } from '../access'
import { formatSlug } from '../hooks/formatSlug'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'

const paths = (doc: Record<string, unknown>) => ['/resources', `/resources/${doc.slug}`]

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'type'],
  },
  hooks: {
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionOnDelete(paths)],
  },
  access: {
    read: () => true,
    create: isContentEditorOrUp,
    update: isContentEditorOrUp,
    delete: isContentEditorOrUp,
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
      options: [
        { label: 'Start Here (New to Faith)', value: 'start-here' },
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
