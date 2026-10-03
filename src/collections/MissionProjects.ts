import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp } from '../access'
import { formatSlug } from '../hooks/formatSlug'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'

const paths = () => ['/missions']

export const MissionProjects: CollectionConfig = {
  slug: 'mission-projects',
  labels: { singular: 'Mission Project', plural: 'Mission Projects' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'location', 'status'],
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
      admin: { description: 'Auto-generated from the title if left blank.' },
      hooks: { beforeValidate: [formatSlug('title')] },
    },
    { name: 'location', type: 'text', admin: { description: 'Country or region, e.g. "Northern Ghana".' } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
      ],
    },
    { name: 'summary', type: 'textarea', admin: { description: 'A short description shown on the Missions page.' } },
    { name: 'description', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Main photo.' } },
    {
      name: 'gallery',
      type: 'array',
      admin: { description: 'More photos from the project — shown as the multimedia archive.' },
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: { description: 'Optional YouTube link to a video about the project.' },
    },
    { name: 'prayerNeeds', type: 'textarea', admin: { description: 'Shown as "Pray for this project".' } },
    {
      name: 'givingFund',
      type: 'text',
      admin: {
        description:
          'Optional. The exact name of a fund from Settings → Giving → Funds. Adds a "Give to this project" button that pre-selects that fund.',
      },
    },
  ],
}
