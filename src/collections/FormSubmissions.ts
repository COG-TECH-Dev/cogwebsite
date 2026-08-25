import type { CollectionConfig } from 'payload'

import { pastoralReadOnly, publicCreateOnly } from '../access'
import { notifyOnSubmission } from '../hooks/notifyOnSubmission'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    group: 'People & Enquiries',
    useAsTitle: 'name',
    defaultColumns: ['name', 'formType', 'createdAt'],
  },
  hooks: {
    afterChange: [
      notifyOnSubmission(
        'New Website Enquiry',
        (doc) => `${doc.name} (${doc.email}) submitted a ${doc.formType} form:\n\n${doc.message || '(no message)'}`,
      ),
    ],
  },
  access: {
    // Covers Contact, Appointment, and Membership enquiries under one
    // collection (discriminated by formType) — all three share the same
    // privacy rules, so splitting them into separate collections would
    // just add admin-sidebar clutter without changing access behavior.
    create: publicCreateOnly,
    read: pastoralReadOnly,
    update: pastoralReadOnly,
    delete: pastoralReadOnly,
  },
  fields: [
    {
      name: 'formType',
      type: 'select',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Appointment Request', value: 'appointment' },
        { label: 'Membership', value: 'membership' },
      ],
    },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'preferredDate', type: 'date', admin: { condition: (data) => data.formType === 'appointment' } },
    { name: 'message', type: 'textarea' },
  ],
}
