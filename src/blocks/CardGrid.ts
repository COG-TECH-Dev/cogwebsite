import type { Block } from 'payload'

export const CardGrid: Block = {
  slug: 'cardGrid',
  labels: { singular: 'Card Grid', plural: 'Card Grids' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'eyebrow', type: 'text' },
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
      ],
    },
  ],
}
