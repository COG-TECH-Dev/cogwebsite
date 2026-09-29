import type { GlobalConfig } from 'payload'

import { isAdminOrUpField, isContentEditorOrUp } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

export const Giving: GlobalConfig = {
  slug: 'giving',
  admin: {
    group: 'Settings',
  },
  hooks: {
    afterChange: [revalidateGlobal(['/give'])],
  },
  access: {
    read: () => true,
    update: isContentEditorOrUp,
  },
  fields: [
    {
      name: 'bankTransfer',
      type: 'group',
      admin: {
        description:
          'Shown on the Give page as a "Bank Transfer" option. Leave Account Name blank to hide this option entirely.',
      },
      access: { update: isAdminOrUpField },
      fields: [
        { name: 'accountName', type: 'text', admin: { description: 'e.g. City of God Christian Centre' } },
        { name: 'sortCode', type: 'text', admin: { description: 'e.g. 12-34-56' } },
        { name: 'accountNumber', type: 'text' },
        {
          name: 'referenceNote',
          type: 'text',
          admin: { description: 'e.g. "Please use your name as the payment reference"' },
        },
      ],
    },
    {
      name: 'branches',
      type: 'array',
      admin: {
        description:
          'Which branch a donor is giving to, shown on the online giving page. The first one is used as the default selection.',
      },
      access: { update: isAdminOrUpField },
      fields: [{ name: 'name', type: 'text', required: true }],
      defaultValue: [
        { name: 'Newcastle' },
        { name: 'Sunderland' },
        { name: 'London' },
        { name: 'Middlesbrough' },
        { name: 'Gateshead' },
      ],
    },
    {
      name: 'funds',
      type: 'array',
      admin: {
        description:
          'Funds a donor can choose from on the online giving page. The first one is used as the default selection.',
      },
      access: { update: isAdminOrUpField },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
      ],
      defaultValue: [
        { name: 'General Fund / Tithe', description: 'Support the ongoing ministry and operations of the church.' },
        { name: 'Missions', description: 'Support our missionary partners and outreach beyond our community.' },
        { name: 'Building Fund', description: 'Help us build a house of worship for the next generation.' },
        { name: 'Benevolence', description: 'Support members and the community facing financial hardship.' },
      ],
    },
    {
      name: 'onlineGiving',
      type: 'group',
      admin: {
        description:
          'Fallback link shown only if Stripe isn\'t configured (no STRIPE_SECRET_KEY) — e.g. a Tithe.ly or GoCardless page. Once Stripe is set up, the "Give Online" button uses the native /give/donate flow instead and this is ignored. Leave URL blank to show "coming soon" in the meantime.',
      },
      access: { update: isAdminOrUpField },
      fields: [
        { name: 'url', type: 'text' },
        { name: 'label', type: 'text', defaultValue: 'Give Online' },
      ],
    },
    {
      name: 'charityNumber',
      type: 'text',
      access: { update: isAdminOrUpField },
      admin: { description: 'Optional. Shown in the Gift Aid section if set.' },
    },
  ],
}
