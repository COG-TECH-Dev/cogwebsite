import type { Block } from 'payload'

export const ImageGrid: Block = {
  slug: 'imageGrid',
  labels: { singular: 'Image Grid', plural: 'Image Grids' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
  ],
}
