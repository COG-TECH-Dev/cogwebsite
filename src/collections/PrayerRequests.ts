import type { CollectionConfig } from 'payload'

import { pastoralReadOnly, publicCreateOnly } from '../access'
import { notifyOnSubmission } from '../hooks/notifyOnSubmission'

export const PrayerRequests: CollectionConfig = {
  slug: 'prayer-requests',
  admin: {
    group: 'People & Enquiries',
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'createdAt'],
  },
  hooks: {
    afterChange: [
      notifyOnSubmission(
        'New Prayer Request',
        (doc) => `${doc.name} submitted a prayer request:\n\n${doc.request}`,
      ),
    ],
  },
  access: {
    // Anyone can submit a prayer request; only Admin/Pastor and above can
    // ever read, update, or delete them — kept as its own collection
    // (rather than merged with general enquiries) because of that stricter
    // confidentiality bar.
    create: publicCreateOnly,
    read: pastoralReadOnly,
    update: pastoralReadOnly,
    delete: pastoralReadOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'request', type: 'textarea', required: true },
    { name: 'isConfidential', type: 'checkbox', defaultValue: false },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Prayed For', value: 'prayed-for' },
      ],
    },
  ],
}
