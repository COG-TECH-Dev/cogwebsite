import type { GlobalConfig } from 'payload'

import { isAdminOrUpField, isContentEditorOrUp } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Settings',
  },
  hooks: {
    // The root layout (Nav/Footer) has no `revalidate` export of its own,
    // so without this, Settings changes would never appear until the next
    // full deploy. `'layout'` busts everything under the root layout.
    afterChange: [revalidateGlobal(['/'])],
  },
  access: {
    read: () => true,
    // Broad enough for Content Editor to attempt an update at all — the
    // field-level `isAdminOrUpField` below then locks down every field
    // except socialLinks, so in practice a Content Editor can only ever
    // change the social links (matches the plan's permission matrix).
    update: isContentEditorOrUp,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'City of God Christian Centre',
      access: { update: isAdminOrUpField },
    },
    {
      name: 'serviceTimes',
      type: 'array',
      access: { update: isAdminOrUpField },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'time', type: 'text', required: true },
      ],
    },
    {
      name: 'address',
      type: 'group',
      access: { update: isAdminOrUpField },
      fields: [
        { name: 'line1', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'postcode', type: 'text' },
      ],
    },
    { name: 'contactEmail', type: 'text', access: { update: isAdminOrUpField } },
    { name: 'contactPhone', type: 'text', access: { update: isAdminOrUpField } },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'youtube', type: 'text' },
      ],
    },
    {
      name: 'nav',
      type: 'array',
      access: { update: isAdminOrUpField },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'footerText', type: 'textarea', access: { update: isAdminOrUpField } },
    {
      name: 'homepageHero',
      type: 'group',
      access: { update: isAdminOrUpField },
      fields: [
        { name: 'headline', type: 'text' },
        { name: 'tagline', type: 'text' },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
