import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/siteUrl'

/**
 * Search engines may read the whole public site on the church's own address. Staff and private pages are left out, and any
 * other address that serves this site (the Vercel address, a preview) is closed to them, so it never competes with the
 * real domain in search results.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = getSiteUrl()
  const host = (await headers()).get('host')
  if (host && host !== new URL(site).host) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/media/'],
      disallow: ['/admin', '/api/', '/give/manage', '/give/donate/success', '/give/donate/cancelled'],
    },
    sitemap: `${site}/sitemap.xml`,
  }
}
