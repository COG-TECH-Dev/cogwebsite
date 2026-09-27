import type { Block } from 'payload'

import { ICON_OPTIONS } from './iconOptions'

export const CardGrid: Block = {
  slug: 'cardGrid',
  labels: { singular: 'Card Grid', plural: 'Card Grids' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'eyebrow', type: 'text' },
    {
      name: 'intro',
      type: 'textarea',
      admin: { description: 'Optional short paragraph shown under the heading.' },
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '2',
      options: [
        { label: '2 columns', value: '2' },
        { label: '3 columns', value: '3' },
        { label: '4 columns', value: '4' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        {
          name: 'icon',
          type: 'select',
          options: [...ICON_OPTIONS],
          admin: { description: 'Optional icon shown at the top of the card.' },
        },
        {
          name: 'footnote',
          type: 'text',
          admin: { description: 'Optional small line at the bottom, e.g. a scripture reference.' },
        },
        {
          name: 'href',
          type: 'text',
          admin: {
            description:
              'Optional link — makes the whole card clickable. Use /about/history for pages on this site, or a full https:// address for other websites.',
          },
        },
      ],
    },
  ],
}
