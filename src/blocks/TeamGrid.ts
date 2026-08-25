import type { Block } from 'payload'

export const TeamGrid: Block = {
  slug: 'teamGrid',
  labels: { singular: 'Team Grid', plural: 'Team Grids' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'members',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'title', type: 'text' },
        { name: 'photo', type: 'upload', relationTo: 'media' },
        { name: 'bio', type: 'textarea' },
      ],
    },
  ],
}
