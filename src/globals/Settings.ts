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
      name: 'dutyPastor',
      type: 'group',
      access: { update: isAdminOrUpField },
      admin: {
        description:
          'The pastor on call this week. Shown on the Leadership page and the Connect page when ticked on. Only publish contact details you are comfortable having public.',
      },
      fields: [
        { name: 'show', type: 'checkbox', defaultValue: false, label: 'Show on the website' },
        { name: 'name', type: 'text', admin: { description: 'e.g. "Pastor Udu"' } },
        { name: 'phone', type: 'text', admin: { description: 'Optional. Leave empty to show the name and note only.' } },
        { name: 'note', type: 'textarea', admin: { description: 'e.g. "On call 24/7 this week for urgent pastoral needs."' } },
      ],
    },
    {
      name: 'formEmails',
      type: 'group',
      // These addresses are for the website to use, so they are not handed out through the public API.
      access: { read: isAdminOrUpField, update: isAdminOrUpField },
      admin: { description: 'Who receives the email when someone submits a form that has its own team.' },
      fields: [
        {
          name: 'firstTimer',
          type: 'text',
          label: 'First-time visitor forms go to',
          admin: { description: 'Leave empty to use vip@cityofgodchristiancentre.org.' },
        },
        {
          name: 'welfare',
          type: 'text',
          label: 'Welfare requests go to',
          admin: {
            description:
              'The welfare team\'s email. Leave empty to use the general notification address (NOTIFY_EMAIL). The email only says a request has arrived and never contains the details; the team signs in to read them.',
          },
        },
      ],
    },
    {
      name: 'welfareSupport',
      type: 'group',
      label: 'Welfare & Support page',
      access: { update: isAdminOrUpField },
      admin: {
        description:
          'What the Welfare & Support page shows. The list stays hidden until you add a service, so only add help the church really offers.',
      },
      fields: [
        {
          name: 'replyTime',
          type: 'text',
          label: 'How quickly we reply',
          admin: {
            description:
              'Completes the confirmation message: "Someone from our welfare team will be in touch discreetly, ___." For example "within 2 working days". Leave empty to promise no time.',
          },
        },
        {
          name: 'services',
          type: 'array',
          label: 'Support the church offers',
          labels: { singular: 'Service', plural: 'Services' },
          fields: [
            { name: 'name', type: 'text', required: true, admin: { description: 'e.g. "Benevolence fund" or "Pastoral counselling"' } },
            {
              name: 'type',
              type: 'select',
              required: true,
              defaultValue: 'financial',
              options: [
                { label: 'Financial help', value: 'financial' },
                { label: 'Counselling', value: 'counselling' },
                { label: 'Food and practical help', value: 'food' },
                { label: 'Other', value: 'other' },
              ],
            },
            { name: 'description', type: 'textarea', admin: { description: 'What it offers, in plain words.' } },
            { name: 'whoFor', type: 'text', label: 'Who it is for', admin: { description: 'e.g. "Anyone in the church community, or the local area"' } },
            { name: 'howToAccess', type: 'text', label: 'How to get it', admin: { description: 'e.g. "Ask using the form below, or speak to a pastor after a service"' } },
            { name: 'phone', type: 'text', admin: { description: 'Optional. Shown on the page.' } },
            { name: 'email', type: 'text', admin: { description: 'Optional. Shown on the page.' } },
            { name: 'link', type: 'text', admin: { description: 'Optional web address for more information.' } },
          ],
        },
      ],
    },
    {
      name: 'safeguarding',
      type: 'group',
      access: { update: isAdminOrUpField },
      admin: {
        description:
          'Switches on the Safeguarding page and its "raise a concern" form. It stays hidden until you tick the box, so fill in the Safeguarding Lead details and have the page reviewed first. Someone must be reading the alerts before this goes on.',
      },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false, label: 'Show the Safeguarding page and concern form on the website' },
        { name: 'leadName', type: 'text', label: 'Safeguarding Lead — name' },
        { name: 'leadPhone', type: 'text', label: 'Safeguarding Lead — phone' },
        { name: 'leadEmail', type: 'text', label: 'Safeguarding Lead — email' },
        { name: 'deputyName', type: 'text', label: 'Deputy Safeguarding Lead — name' },
        { name: 'deputyPhone', type: 'text', label: 'Deputy Safeguarding Lead — phone' },
        {
          name: 'alertEmail',
          type: 'text',
          label: 'Send "new concern" alerts to',
          access: { read: isAdminOrUpField },
          admin: { description: "Leave empty to use the lead's email. The alert never contains the details of the concern." },
        },
        { name: 'reviewedOn', type: 'text', label: 'Policy last reviewed', admin: { description: 'e.g. "October 2026". Shown on the page.' } },
      ],
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'youtube', type: 'text' },
        { name: 'tiktok', type: 'text' },
        { name: 'radioUrl', type: 'text', admin: { description: 'COG Grand Radio (external site)' } },
        {
          name: 'radioAppUrl',
          type: 'text',
          label: 'COG Grand Radio app',
          admin: { description: 'Where "Get the app" opens on the COG Grand Radio page. Leave empty to use https://app.coggrandradiouk.org/.' },
        },
        {
          name: 'youtubeChannelId',
          type: 'text',
          admin: {
            description:
              "Powers the live stream embed on COG TV. This is the channel's ID (starts with UC…), not the @handle — find it on the channel's About page under 'Share channel'.",
          },
        },
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
        { name: 'declarationLine', type: 'text', admin: { description: 'Short spoken-word line, e.g. "A Place where God lives and Miracles happen Naturally."' } },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
        {
          name: 'backgroundVideoUrl',
          type: 'text',
          admin: {
            description: 'A direct .mp4 URL for a looping hero video. Takes priority over the background image when set.',
          },
        },
      ],
    },
  ],
}
