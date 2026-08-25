import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp } from '../access'

export const BookstoreItems: CollectionConfig = {
  slug: 'bookstore-items',
  labels: { singular: 'Bookstore Item', plural: 'Bookstore Items' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'author'],
  },
  access: {
    read: () => true,
    create: isContentEditorOrUp,
    update: isContentEditorOrUp,
    delete: isContentEditorOrUp,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'author', type: 'text' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'priceDisplay', type: 'text', admin: { description: 'e.g. "£9.99"' } },
    { name: 'externalPurchaseLink', type: 'text', required: true },
  ],
}
