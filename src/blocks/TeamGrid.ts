import type { Block } from 'payload'

export const TeamGrid: Block = {
  slug: 'teamGrid',
  labels: { singular: 'Team Grid', plural: 'Team Grids' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'eyebrow', type: 'text' },
    {
      name: 'featureFirst',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Show the first person as a large highlighted card (e.g. the Lead Pastor).' },
    },
    {
      name: 'members',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'title', type: 'text' },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'A portrait photo. If empty, a coloured card with their initials is shown. On the large highlighted card (the first person, when that is ticked above) a full-length, full-height photo is shown whole, never cropped.',
          },
        },
        { name: 'bio', type: 'textarea' },
        {
          name: 'message',
          type: 'textarea',
          admin: {
            description:
              'Optional: a personal welcome or message from this person. It is shown beside their name on the large highlighted card (the first person, when that is ticked above). Separate paragraphs with a blank line.',
          },
        },
      ],
    },
  ],
}
