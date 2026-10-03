import type { Access, CollectionConfig } from 'payload'

import { pastoralReadOnly, publicCreateOnly } from '../access'
import { notifyOnSubmission } from '../hooks/notifyOnSubmission'

// Admin / Super Admin see every request. A Ministry Leader sees only the ones
// the person chose to share with the ministry team ("semi-private") — never
// the private ones. Everyone else sees none.
const readPrayerRequests: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'super-admin' || user.role === 'admin') return true
  if (user.role === 'ministry-leader') return { visibility: { equals: 'ministry-team' } }
  return false
}

export const PrayerRequests: CollectionConfig = {
  slug: 'prayer-requests',
  admin: {
    group: 'People & Enquiries',
    useAsTitle: 'name',
    defaultColumns: ['name', 'visibility', 'status', 'createdAt'],
  },
  hooks: {
    afterChange: [
      notifyOnSubmission(
        'New Prayer Request',
        (doc) =>
          `${doc.name} submitted a prayer request (${
            doc.visibility === 'public'
              ? 'for the public prayer wall — needs approval'
              : doc.visibility === 'ministry-team'
                ? 'shared with the ministry team'
                : 'private — prayer team only'
          }):\n\n${doc.request}`,
      ),
    ],
  },
  access: {
    // Anyone can submit a prayer request. Reading is limited as described
    // above; updating/deleting stays Admin/Pastor and above. The public prayer
    // wall never reads through here — it uses the server-side Local API and
    // only ever renders first name + request for approved public entries.
    create: publicCreateOnly,
    read: readPrayerRequests,
    update: pastoralReadOnly,
    delete: pastoralReadOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'request', type: 'textarea', required: true },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'private',
      options: [
        { label: 'Private — prayer team only', value: 'private' },
        { label: 'Shared with the ministry team', value: 'ministry-team' },
        { label: 'Public prayer wall', value: 'public' },
      ],
      admin: { description: 'Who the person said may see this request.' },
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Public prayer wall only: tick to show this on the wall. Read it first, and edit out anything that identifies someone or is not suitable. Only the first name is ever displayed.',
        condition: (data) => data.visibility === 'public',
      },
    },
    // Kept from before the three-way choice existed — older requests only have
    // this. New requests set it to match "Private".
    {
      name: 'isConfidential',
      type: 'checkbox',
      defaultValue: false,
      admin: { hidden: true },
    },
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
