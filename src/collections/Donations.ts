import type { CollectionConfig } from 'payload'

import { pastoralReadOnly } from '../access'

export const Donations: CollectionConfig = {
  slug: 'donations',
  admin: {
    group: 'Giving',
    useAsTitle: 'donorName',
    defaultColumns: ['donorName', 'amount', 'branch', 'fund', 'frequency', 'status', 'createdAt'],
    description:
      'Records of online gifts made through Stripe. Created automatically when someone starts giving on /give/donate, and marked Completed by the Stripe webhook once payment succeeds.',
  },
  access: {
    // Deliberately no public create — a real record is only ever written by
    // our own server code via the Local API (createDonationCheckout /
    // the Stripe webhook), which bypasses access control entirely. Locking
    // the REST/GraphQL create path shut means nobody can POST a fake
    // "completed" donation (with fabricated Gift Aid address/postcode data)
    // through the public API.
    create: () => false,
    read: pastoralReadOnly,
    update: pastoralReadOnly,
    delete: pastoralReadOnly,
  },
  fields: [
    { name: 'donorName', type: 'text', required: true },
    { name: 'donorEmail', type: 'text', required: true },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: { description: 'In pence (e.g. 2500 = £25.00), matching Stripe\'s own convention.' },
    },
    { name: 'branch', type: 'text', required: true },
    { name: 'fund', type: 'text', required: true },
    {
      name: 'frequency',
      type: 'select',
      required: true,
      defaultValue: 'one-time',
      options: [
        { label: 'One-Time', value: 'one-time' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'For a recurring gift: the day the donor chose for the first gift. Empty means it started straight away.',
      },
    },
    {
      name: 'giftAid',
      type: 'group',
      admin: { description: 'HMRC requires a home address + postcode for a valid Gift Aid declaration.' },
      fields: [
        { name: 'declared', type: 'checkbox', defaultValue: false },
        { name: 'fullName', type: 'text' },
        { name: 'address', type: 'textarea' },
        { name: 'postcode', type: 'text' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Scheduled (recurring gift, starts later)', value: 'scheduled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'paidAt',
      type: 'date',
      admin: { description: 'When Stripe confirmed payment — distinct from createdAt (when the donor started checkout).' },
    },
    { name: 'stripeCheckoutSessionId', type: 'text', index: true },
    { name: 'stripeCustomerId', type: 'text', index: true },
    { name: 'stripeSubscriptionId', type: 'text', index: true },
    {
      name: 'stripeInvoiceId',
      type: 'text',
      index: true,
      admin: { description: 'Set on recurring renewal charges (from invoice.paid) — prevents double-recording the same charge.' },
    },
  ],
}
