import type { GlobalConfig } from 'payload'

import { isAdminOrUpField, isContentEditorOrUp } from '../access'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Settings',
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
