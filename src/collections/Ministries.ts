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
