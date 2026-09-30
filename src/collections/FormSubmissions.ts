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
        (doc) =>
          `${doc.name || 'Someone (anonymous)'}${doc.email ? ` (${doc.email})` : ''} submitted a ${doc.formType} form:\n\n${doc.message || '(no message)'}`,
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
        { label: 'Reference Letter Request', value: 'reference-letter' },
        { label: 'Welfare & Support Request', value: 'welfare' },
        { label: 'Step of Faith', value: 'step-of-faith' },
      ],
    },
    {
      name: 'name',
      type: 'text',
      // Optional only for Step of Faith — that form explicitly lets someone
      // respond anonymously and still see their next steps (matches the
      // church's existing wording for this flow).
      validate: (value: unknown, { siblingData }: { siblingData?: { formType?: string } }) => {
        if (siblingData?.formType === 'step-of-faith') return true
        return value ? true : 'Name is required.'
      },
    },
    {
      name: 'email',
      type: 'text',
      validate: (value: unknown, { siblingData }: { siblingData?: { formType?: string } }) => {
        if (siblingData?.formType === 'step-of-faith') return true
        return value ? true : 'Email is required.'
      },
    },
    { name: 'phone', type: 'text' },
    { name: 'preferredDate', type: 'date', admin: { condition: (data) => data.formType === 'appointment' } },
    {
      name: 'interestedMinistry',
      type: 'relationship',
      relationTo: 'ministries',
      admin: {
        description: 'Which ministry they want to join.',
        condition: (data) => data.formType === 'membership',
      },
    },
    {
      name: 'letterType',
      type: 'select',
      options: [
        { label: 'Character Reference', value: 'character' },
        { label: 'Membership Confirmation', value: 'membership-confirmation' },
        { label: 'Financial Reference', value: 'financial' },
        { label: 'Other', value: 'other' },
      ],
      admin: { condition: (data) => data.formType === 'reference-letter' },
    },
    {
      name: 'purpose',
      type: 'text',
      admin: {
        description: 'What the reference letter is for.',
        condition: (data) => data.formType === 'reference-letter',
      },
    },
    {
      name: 'requiredByDate',
      type: 'date',
      admin: { condition: (data) => data.formType === 'reference-letter' },
    },
    {
      name: 'supportType',
      type: 'select',
      options: [
        { label: 'Financial', value: 'financial' },
        { label: 'Counselling', value: 'counselling' },
        { label: 'Food / Practical Needs', value: 'food' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'What kind of support they need.',
        condition: (data) => data.formType === 'welfare',
      },
    },
    {
      name: 'decisionType',
      type: 'select',
      options: [
        { label: "I'm trusting Jesus for the first time", value: 'first-time' },
        { label: "I'm recommitting my life to Christ", value: 'recommitting' },
        { label: 'I want to learn more before deciding', value: 'learn-more' },
      ],
      admin: { condition: (data) => data.formType === 'step-of-faith' },
    },
    { name: 'message', type: 'textarea' },
  ],
}
