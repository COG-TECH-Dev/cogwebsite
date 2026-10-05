import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp, isMinistryLeaderOfDoc } from '../access'
import { ICON_OPTIONS } from '../blocks/iconOptions'
import { formatSlug } from '../hooks/formatSlug'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'

const paths = (doc: Record<string, unknown>) => ['/', '/ministries', `/ministries/${doc.slug}`]

export const Ministries: CollectionConfig = {
  slug: 'ministries',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'featured'],
  },
  hooks: {
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionOnDelete(paths)],
  },
  access: {
    read: () => true,
    create: isContentEditorOrUp,
    // Content Editor+ can update any ministry; a Ministry Leader can only
    // update the ministry/ministries assigned to them on their user record.
    update: isMinistryLeaderOfDoc('id'),
    delete: isContentEditorOrUp,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Auto-generated from the name if left blank. Used in the page URL.' },
      hooks: { beforeValidate: [formatSlug('name')] },
    },
    { name: 'summary', type: 'textarea' },
    { name: 'description', type: 'richText' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional. If left empty, an icon is shown instead.' },
    },
    {
      name: 'icon',
      type: 'select',
      options: [...ICON_OPTIONS],
      admin: {
        description: 'Shown when no photo is uploaded. Leave unset to auto-pick one based on the ministry name.',
      },
    },
    { name: 'leaderName', type: 'text' },
    {
      name: 'contactEmail',
      type: 'text',
      admin: { description: 'Shown on the ministry page so people can reach the leadership. Optional.' },
    },
    { name: 'contactPhone', type: 'text', admin: { description: 'Optional. Shown on the ministry page.' } },
    {
      name: 'ageGroups',
      type: 'array',
      label: 'Classes / age groups',
      admin: {
        description:
          "One entry per class, e.g. Pearls, Under 3 years, and a sentence on what the children do. Shown on the ministry page. Leave empty on the Children's Ministry to show Pearls, Rubies, Diamond and Gold without descriptions.",
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'ageRange', type: 'text', admin: { description: 'e.g. "4–5 years"' } },
        { name: 'description', type: 'textarea', admin: { description: 'What the class does, in a sentence or two.' } },
      ],
    },
    {
      name: 'meetingTimes',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'time', type: 'text', required: true },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'isChildrensMinistry',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          "Shows a distinct, kid-friendly visual style and the photo consent / volunteer / pre-registration safeguarding forms on this ministry's page.",
      },
    },
  ],
}
