import type { CollectionConfig } from 'payload'

import { isMinistryLeaderOfDoc } from '../access'
import { restrictPublishToContentEditor } from '../hooks/restrictPublishToContentEditor'

export const MediaGalleryItems: CollectionConfig = {
  slug: 'media-gallery-items',
  labels: { singular: 'Media Gallery Item', plural: 'Media Gallery Items' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'relatedMinistry'],
  },
  versions: { drafts: true },
  hooks: {
    beforeChange: [restrictPublishToContentEditor],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: isMinistryLeaderOfDoc('relatedMinistry'),
    delete: isMinistryLeaderOfDoc('relatedMinistry'),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'gallery',
      options: [
        { label: 'Gallery', value: 'gallery' },
        { label: 'COG TV', value: 'cog-tv' },
        { label: 'COG Grand Radio', value: 'cog-grand-radio' },
      ],
    },
    {
      name: 'images',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'videoEmbedUrl',
      type: 'text',
      admin: { description: 'YouTube or other video URL, for COG TV items.' },
    },
    { name: 'relatedMinistry', type: 'relationship', relationTo: 'ministries' },
    { name: 'relatedEvent', type: 'relationship', relationTo: 'events' },
  ],
}
