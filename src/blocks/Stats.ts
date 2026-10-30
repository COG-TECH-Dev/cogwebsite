import type { Block } from 'payload'

export const Stats: Block = {
  slug: 'stats',
  labels: { singular: 'Stats', plural: 'Stats Blocks' },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: { description: 'For a stat labelled "Years of Ministry" this is ignored: the site works the figure out itself and adds one every 10 October.' },
        },
        { name: 'label', type: 'text', required: true },
      ],
    },
  ],
}
