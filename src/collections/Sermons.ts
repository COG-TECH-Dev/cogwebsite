import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp } from '../access'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'

const paths = (doc: Record<string, unknown>) => ['/', '/media/sermons', `/media/sermons/${doc.slug}`]

export const Sermons: CollectionConfig = {
  slug: 'sermons',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'speaker', 'date', 'featured'],
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
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'speaker', type: 'text' },
    { name: 'date', type: 'date', required: true },
    { name: 'series', type: 'text' },
    { name: 'scriptureReference', type: 'text' },
    { name: 'audioUrl', type: 'text' },
    { name: 'videoUrl', type: 'text' },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'richText' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
}
