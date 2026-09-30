import type { CollectionConfig } from 'payload'

import { pastoralReadOnly, publicCreateOnly } from '../access'
import { notifyOnSubmission } from '../hooks/notifyOnSubmission'

export const ChildSafeguardingForms: CollectionConfig = {
  slug: 'child-safeguarding-forms',
  admin: {
    group: 'People & Enquiries',
    useAsTitle: 'parentName',
    defaultColumns: ['parentName', 'formType', 'status', 'createdAt'],
    description:
      "Photo/media consent, volunteer interest, and pre-registration submissions from the Children's Ministry page. Contains data about minors — admin/super-admin only.",
  },
  hooks: {
    afterChange: [
      notifyOnSubmission(
        "New Children's Ministry Form",
        (doc) =>
          `${doc.parentName} (${doc.parentEmail}) submitted a ${doc.formType} form for the Children's Ministry.`,
      ),
    ],
  },
  access: {
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
        { label: 'Photo/Media Consent', value: 'photo-consent' },
        { label: 'Volunteer Interest', value: 'volunteer-interest' },
        { label: 'Child Pre-Registration', value: 'pre-registration' },
      ],
    },
    { name: 'parentName', type: 'text', required: true },
    { name: 'parentEmail', type: 'text', required: true },
    { name: 'parentPhone', type: 'text' },
    {
      name: 'childName',
      type: 'text',
      admin: { condition: (data) => data.formType === 'photo-consent' || data.formType === 'pre-registration' },
    },
    {
      name: 'childDOB',
      type: 'date',
      admin: {
        description: 'Used to place your child in the right age group.',
        condition: (data) => data.formType === 'pre-registration',
      },
    },
    {
      name: 'photoConsent',
      type: 'select',
      options: [
        { label: 'Consented', value: 'consent' },
        { label: 'Declined', value: 'decline' },
      ],
      admin: {
        description: 'The explicit, recorded consent decision — never inferred, always one or the other (CLR-005).',
        condition: (data) => data.formType === 'photo-consent',
      },
    },
    {
      name: 'allergiesOrMedicalNotes',
      type: 'textarea',
      admin: {
        description: 'Any allergies, medical conditions, or other information our team should know.',
        condition: (data) => data.formType === 'pre-registration',
      },
    },
    {
      name: 'emergencyContactName',
      type: 'text',
      admin: { condition: (data) => data.formType === 'pre-registration' },
    },
    {
      name: 'emergencyContactPhone',
      type: 'text',
      admin: { condition: (data) => data.formType === 'pre-registration' },
    },
    {
      name: 'availability',
      type: 'text',
      admin: {
        description: 'Days/times they could help.',
        condition: (data) => data.formType === 'volunteer-interest',
      },
    },
    {
      name: 'vettingAcknowledged',
      type: 'checkbox',
      admin: {
        description: 'Confirms they were told a DBS/reference check is required before serving.',
        condition: (data) => data.formType === 'volunteer-interest',
      },
    },
    { name: 'message', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Resolved', value: 'resolved' },
      ],
    },
  ],
}
