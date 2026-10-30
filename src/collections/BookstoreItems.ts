import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp } from '../access'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'

const paths = () => ['/resources/bookstore']

export const BookstoreItems: CollectionConfig = {
  slug: 'bookstore-items',
  labels: { singular: 'Bookstore Item', plural: 'Bookstore Items' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'priceDisplay'],
    description: 'Books shown on the Bookstore page (Resources menu). Visitors order with a form and collect the book at church; each order arrives as a form submission and by email.',
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
    { name: 'author', type: 'text' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'textarea', admin: { description: 'Optional: a line or two about the book.' } },
    { name: 'priceDisplay', type: 'text', admin: { description: 'e.g. "£10". Shown on the page and used to work out the total on an order.' } },
    {
      name: 'externalPurchaseLink',
      type: 'text',
      admin: { description: 'Optional. Leave empty for a book collected at church. If you add a shop link, a "Buy online" link also shows.' },
    },
  ],
}
