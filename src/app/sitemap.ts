import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'
import { publishedOnly } from '@/lib/published'
import { getSiteUrl } from '@/lib/siteUrl'

export const revalidate = 3600

// The pages that always exist. Private pages (the giving account, payment results) are left out.
const PAGES = [
  '/',
  '/about',
  '/about/vision-mission',
  '/about/tenets',
  '/about/history',
  '/about/leadership',
  '/about/lead-pastor',
  '/ministries',
  '/programmes',
  '/media',
  '/media/cog-tv',
  '/media/gallery',
  '/media/cog-grand-radio',
  '/news',
  '/missions',
  '/give',
  '/give/donate',
  '/resources',
  '/resources/bookstore',
  '/gateshead',
  '/connect',
  '/connect/new-here',
  '/connect/next-steps',
  '/connect/find-a-campus',
  '/connect/homegroups',
  '/connect/life-events',
  '/connect/appointments',
  '/connect/contact',
  '/connect/membership',
  '/connect/prayer-request',
  '/connect/prayer-wall',
  '/connect/reference-letter',
  '/connect/share-testimony',
  '/connect/welfare',
  '/safeguarding',
  '/cookie-policy',
  '/privacy-policy',
  '/terms-of-use',
]

// The pages made from the content in the admin: one for each ministry, published event and news post, and each resource and message.
const COLLECTIONS = [
  { collection: 'ministries', prefix: '/ministries', published: false },
  { collection: 'events', prefix: '/programmes', published: true },
  { collection: 'news', prefix: '/news', published: true },
  { collection: 'resources', prefix: '/resources', published: false },
  { collection: 'sermons', prefix: '/media/cog-tv', published: false },
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl()
  const entries: MetadataRoute.Sitemap = PAGES.map((path) => ({ url: `${site}${path === '/' ? '' : path}` }))

  try {
    const payload = await getPayloadClient()
    for (const { collection, prefix, published } of COLLECTIONS) {
      const result = await payload.find({
        collection,
        ...(published ? { where: publishedOnly, draft: false } : {}),
        limit: 1000,
        pagination: false,
        depth: 0,
        select: { slug: true, updatedAt: true },
      })
      for (const doc of result.docs) {
        if (doc.slug) entries.push({ url: `${site}${prefix}/${doc.slug}`, lastModified: doc.updatedAt })
      }
    }
  } catch {
    // The database is unreachable: the fixed pages above are still listed.
  }
  return entries
}
