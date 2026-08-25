import type { Block } from 'payload'

export const Embed: Block = {
  slug: 'embed',
  labels: { singular: 'Embed', plural: 'Embeds' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'A YouTube/video URL, map link, or other embeddable URL.',
      },
    },
  ],
}
