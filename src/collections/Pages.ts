import type { CollectionConfig } from 'payload'

import { isContentEditorOrUp } from '../access'
import { formatSlug } from '../hooks/formatSlug'
import { revalidateCollection, revalidateCollectionOnDelete } from '../hooks/revalidate'
import {
  CallToAction,
  CardGrid,
  Embed,
  FAQAccordion,
  Hero,
  ImageGrid,
  RichTextBlock,
  SplitFeature,
  Stats,
  TeamGrid,
  Timeline,
  TestimonialsBlock,
} from '../blocks'

// Covers /about, /give (top-level slugs), /about/[slug] (subpages), and the
// /[...slug] catch-all — revalidating a path that was never generated is a
// harmless no-op, so it's simpler to cover every shape than to know which
// route rendered this particular page.
const paths = (doc: Record<string, unknown>) => [`/${doc.slug}`, `/about/${doc.slug}`]

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'parent'],
  },
  versions: { drafts: true },
  hooks: {
    afterChange: [revalidateCollection(paths)],
    afterDelete: [revalidateCollectionOnDelete(paths)],
  },
  access: {
    read: () => true,
    create: isContentEditorOrUp,
    update: isContentEditorOrUp,
    delete: isContentEditorOrUp,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Auto-generated from the title if left blank. Used in the page URL.' },
      hooks: { beforeValidate: [formatSlug('title')] },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: { description: 'Short line shown under the page title in the banner at the top of the page.' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        description: 'Optional — nests this page under another (e.g. About subpages).',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        Hero,
        RichTextBlock,
        SplitFeature,
        CardGrid,
        Timeline,
        ImageGrid,
        Stats,
        TeamGrid,
        CallToAction,
        FAQAccordion,
        TestimonialsBlock,
        Embed,
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
      ],
    },
  ],
}
