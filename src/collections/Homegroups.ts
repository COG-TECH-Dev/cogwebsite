import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp } from '../access'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'

const paths = () => ['/connect/homegroups']

export const Homegroups: CollectionConfig = {
  slug: 'homegroups',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'area', 'leaderName'],
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
    { name: 'name', type: 'text', required: true, admin: { description: 'e.g. "Central Newcastle Homegroup"' } },
    {
      name: 'area',
      type: 'text',
      required: true,
      admin: { description: 'The neighbourhood/area it meets in — shown so people can find one near them.' },
    },
    { name: 'leaderName', type: 'text' },
    { name: 'contactEmail', type: 'text' },
    { name: 'contactPhone', type: 'text' },
    { name: 'meetingDay', type: 'text', admin: { description: 'e.g. "Every Tuesday, 7:00 PM"' } },
    { name: 'description', type: 'textarea' },
  ],
}
