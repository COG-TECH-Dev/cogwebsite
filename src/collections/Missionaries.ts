import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp } from '../access'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'

const paths = () => ['/missions']

export const Missionaries: CollectionConfig = {
  slug: 'missionaries',
  labels: { singular: 'Missionary', plural: 'Field Missionaries' },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'location', 'active'],
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
    { name: 'name', type: 'text', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media', admin: { description: 'Only with the missionary\'s consent.' } },
    { name: 'location', type: 'text', admin: { description: 'Where they serve, e.g. "Kumasi, Ghana".' } },
    { name: 'bio', type: 'textarea' },
    { name: 'prayerNeeds', type: 'textarea', admin: { description: 'Shown as "Pray for …".' } },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'mission-projects',
      admin: { description: 'Optional — the project they are part of.' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Untick to stop showing them on the Missions page.' },
    },
  ],
}
