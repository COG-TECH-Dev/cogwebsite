import type { CollectionConfig } from 'payload'

import { isMinistryLeaderOfDoc, readPublishedOrStaff } from '../access'
import { restrictPublishToContentEditor } from '../hooks/restrictPublishToContentEditor'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'

// An item can now appear on several media pages, and un-ticking a page has to
// clear that page's cache too, so every media page is refreshed on any change.
const paths = () => ['/media', '/media/gallery', '/media/cog-tv', '/media/cog-grand-radio']

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
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionOnDelete(paths)],
  },
  access: {
    read: readPublishedOrStaff,
    create: ({ req: { user } }) => Boolean(user),
    update: isMinistryLeaderOfDoc('relatedMinistry'),
    delete: isMinistryLeaderOfDoc('relatedMinistry'),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'category',
      label: 'Show on',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['gallery'],
      options: [
        { label: 'Gallery', value: 'gallery' },
        { label: 'COG TV', value: 'cog-tv' },
        { label: 'COG Grand Radio', value: 'cog-grand-radio' },
      ],
      admin: {
        description: 'Tick every media page this should appear on — more than one is fine.',
      },
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
