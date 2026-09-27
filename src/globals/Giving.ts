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
      name: 'onlineGiving',
      type: 'group',
      admin: {
        description:
          'A link to a card/online giving provider (e.g. Tithe.ly, GoCardless, a Stripe Payment Link). Leave URL blank to show "coming soon" instead.',
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
