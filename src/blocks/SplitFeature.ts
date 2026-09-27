import type { Block } from 'payload'

export const SplitFeature: Block = {
  slug: 'splitFeature',
  labels: { singular: 'Text + Image Section', plural: 'Text + Image Sections' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    {
      name: 'body',
      type: 'textarea',
      admin: { description: 'Leave a blank line between paragraphs.' },
    },
    {
      name: 'bullets',
      type: 'array',
      admin: { description: 'Optional short checklist shown under the text.' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional photo. If left empty, a branded panel with the church logo is shown instead.',
      },
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'Image on the right', value: 'right' },
        { label: 'Image on the left', value: 'left' },
      ],
    },
    {
      name: 'background',
      type: 'select',
      defaultValue: 'light',
      options: [
        { label: 'Plain', value: 'light' },
        { label: 'Warm tint', value: 'tinted' },
      ],
    },
    { name: 'buttonLabel', type: 'text' },
    { name: 'buttonUrl', type: 'text' },
  ],
}
