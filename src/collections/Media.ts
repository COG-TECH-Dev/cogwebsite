import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    description:
      'Pictures for the website. Use "Select a file" (or drag and drop) for one picture, or "Bulk Upload" at the top of this list for many at once. "Paste URL" only works with a direct link to a picture file: a Google Drive folder or share link opens a web page, not a picture, so download the pictures from Drive first and upload them here.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Describe the image for screen readers and SEO — required for accessibility.',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
  upload: {
    staticDir: 'media',
  },
}
