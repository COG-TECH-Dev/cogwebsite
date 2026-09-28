import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp, publicCreateOnly } from '../access'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'

const paths = () => ['/']

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'featured'],
  },
  hooks: {
    afterChange: [
      revalidateCollection(paths),
      // Public self-service submissions land as Pending Review — ping the
      // office so someone actually reviews them. Admin-created testimonials
      // default straight to Approved and don't need this notification.
      async ({ doc, operation, req }) => {
        if (operation === 'create' && doc.status === 'pending-review') {
          const to = process.env.NOTIFY_EMAIL
          if (to) {
            await req.payload.sendEmail({
              to,
              subject: 'New Testimony Submitted',
              text: `${doc.name} shared a testimony, pending review before it can go public:\n\n"${doc.quote}"`,
            })
          }
        }
      },
    ],
    afterDelete: [revalidateCollectionOnDelete(paths)],
  },
  access: {
    read: () => true,
    // Anyone can share a testimony; it stays hidden (status defaults to
    // Pending Review for public submissions) until a Content Editor+
    // approves it. Only staff can edit/delete.
    create: publicCreateOnly,
    update: isContentEditorOrUp,
    delete: isContentEditorOrUp,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'relatedMinistry', type: 'relationship', relationTo: 'ministries' },
    {
      name: 'submitterEmail',
      type: 'text',
      admin: { description: 'Contact email for follow-up only — never shown publicly.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'approved',
      options: [
        { label: 'Pending Review', value: 'pending-review' },
        { label: 'Approved', value: 'approved' },
      ],
      admin: {
        description:
          'Testimonies submitted by the public start as Pending Review and are hidden from the site until switched to Approved here.',
      },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
}
