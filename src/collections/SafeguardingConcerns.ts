import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { isAdminOrUp, isSuperAdmin } from '../access'
import { notifySafeguardingLead } from '../hooks/notifySafeguardingLead'

// A short reference people can quote ("SC-20261003-K7Q2") without using a child's name.
const setReference: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (operation === 'create' && data && !data.reference) {
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    data.reference = `SC-${day}-${rand}`
  }
  return data
}

/**
 * Records of concern sent through the public Safeguarding page. The most
 * sensitive data on the site: nothing is public, the API cannot create
 * records (only the page's own form action can), only Admin / Pastor and
 * Super Admin can read or update them, and only a Super Admin can delete.
 */
export const SafeguardingConcerns: CollectionConfig = {
  slug: 'safeguarding-concerns',
  labels: { singular: 'Safeguarding Concern', plural: 'Safeguarding Concerns' },
  admin: {
    group: 'People & Enquiries',
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'status', 'immediateDanger', 'involvesStaffOrVolunteer', 'createdAt'],
    description:
      'Concerns about a child, sent from the Safeguarding page. Highly sensitive: Admin / Pastor and Super Admin only. Do not delete records — keep them as your safeguarding policy and adviser require. Not included in the data exports.',
  },
  hooks: {
    beforeValidate: [setReference],
    afterChange: [notifySafeguardingLead],
  },
  access: {
    create: () => false,
    read: isAdminOrUp,
    update: isAdminOrUp,
    delete: isSuperAdmin,
  },
  fields: [
    { name: 'reference', type: 'text', unique: true, admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New — not yet read', value: 'new' },
        { label: 'Being looked at', value: 'reviewing' },
        { label: 'Referred on', value: 'referred' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'immediateDanger',
      type: 'checkbox',
      label: 'Reporter said a child is in immediate danger',
      admin: { description: 'Ticked means the sender was told to call 999 first. Treat as urgent.' },
    },
    {
      name: 'involvesStaffOrVolunteer',
      type: 'checkbox',
      label: 'Concern is about someone who works or volunteers at the church',
      admin: {
        description: 'Allegations about a person in a position of trust go to the Local Authority Designated Officer (LADO).',
      },
    },
    { name: 'concern', type: 'textarea', required: true, label: 'What the reporter saw, heard or was told' },
    { name: 'whenAndWhere', type: 'text', label: 'When and where' },
    { name: 'childName', type: 'text', label: "Child's name (if known)" },
    { name: 'childAgeOrDob', type: 'text', label: "Child's age or date of birth (if known)" },
    { name: 'othersTold', type: 'textarea', label: 'Who else has been told, and what has been done so far' },
    {
      name: 'reporter',
      type: 'group',
      label: 'Who sent it (optional — it can be anonymous)',
      fields: [
        { name: 'name', type: 'text' },
        {
          name: 'relationship',
          type: 'select',
          options: [
            { label: 'Church member', value: 'member' },
            { label: 'Parent or carer', value: 'parent' },
            { label: 'Volunteer or leader', value: 'volunteer' },
            { label: 'Visitor', value: 'visitor' },
            { label: 'Child or young person', value: 'child' },
            { label: 'Other', value: 'other' },
          ],
        },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'wantsContact', type: 'checkbox', label: 'Asked for the Safeguarding Lead to contact them' },
      ],
    },
    {
      name: 'lead',
      type: 'group',
      label: 'Safeguarding Lead — what was done',
      fields: [
        {
          name: 'referredTo',
          type: 'select',
          hasMany: true,
          label: 'Referred to',
          options: [
            { label: "Children's social care", value: 'social-care' },
            { label: 'Police', value: 'police' },
            { label: 'LADO (Local Authority Designated Officer)', value: 'lado' },
            { label: 'NSPCC / safeguarding adviser', value: 'adviser' },
            { label: 'Charity Commission (serious incident)', value: 'charity-commission' },
            { label: 'Other', value: 'other' },
            { label: 'No referral needed', value: 'none' },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Decisions, actions and dates',
          admin: { description: 'Record what was decided, who was contacted, when, and why.' },
        },
      ],
    },
  ],
}
