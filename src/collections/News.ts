import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp, readPublishedOrStaff } from '../access'
import { formatSlug } from '../hooks/formatSlug'
import { restrictPublishToContentEditor } from '../hooks/restrictPublishToContentEditor'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'

const paths = (doc: Record<string, unknown>) => ['/', '/news', `/news/${doc.slug}`]

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'News Post', plural: 'News & Announcements' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', 'pinned', '_status'],
  },
  versions: { drafts: true },
  hooks: {
    beforeChange: [restrictPublishToContentEditor],
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionOnDelete(paths)],
  },
  access: {
    // The public only ever sees published posts; signed-in staff also see drafts.
    read: readPublishedOrStaff,
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
      name: 'publishedDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { description: 'Shown on the post and used to order the news page (newest first).' },
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: { description: 'One or two sentences — shown on the homepage and the news list.' },
    },
    { name: 'body', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Optional.' } },
    {
      name: 'pinned',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Pinned posts stay at the top of the news page and the homepage.' },
    },
  ],
}
