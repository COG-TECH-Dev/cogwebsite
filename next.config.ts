import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Required by Dockerfile's multi-stage build (copies .next/standalone) —
  // but Vercel has its own build packaging and breaks if this is set
  // (fails post-build with an ENOENT on a .nft.json trace file), so only
  // apply it outside Vercel's own build environment.
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/images/**',
      },
    ],
    // Only relevant once BLOB_READ_WRITE_TOKEN is set (Vercel deployment) —
    // Media uploads then live at this domain instead of local disk.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  // Maps every real URL found on the old WordPress staging site's sitemap
  // (staging.cityofgodchristiancentre.org/sitemap.xml) to its equivalent
  // here, so any search-engine ranking or bookmarked link isn't lost when
  // that site is retired. Content pages with no direct equivalent yet
  // (baptism/weddings/child-dedication) fall back to Contact rather than
  // 404ing. Excludes WordPress's own default noise (/sample-page/,
  // /hello-world/).
  async redirects() {
    return [
      { source: '/prayer-request', destination: '/connect/prayer-request', permanent: true },
      { source: '/about-us', destination: '/about', permanent: true },
      { source: '/our-vision-and-mission', destination: '/about/vision-mission', permanent: true },
      { source: '/tenets-of-faith', destination: '/about/tenets', permanent: true },
      { source: '/our-history', destination: '/about/history', permanent: true },
      { source: '/baptism', destination: '/connect/contact', permanent: true },
      { source: '/weddings', destination: '/connect/contact', permanent: true },
      { source: '/child-dedication', destination: '/ministries/childrens-ministry', permanent: true },
      { source: '/gallery', destination: '/media/gallery', permanent: true },
      { source: '/cog-tv', destination: '/media/cog-tv', permanent: true },
      { source: '/cog-grand-radio', destination: '/media/cog-grand-radio', permanent: true },
      { source: '/im-new-here', destination: '/connect/new-here', permanent: true },
      { source: '/online-giving', destination: '/give', permanent: true },
      { source: '/book-an-appointment', destination: '/connect/appointments', permanent: true },
      { source: '/request-a-reference-letter', destination: '/connect/reference-letter', permanent: true },
      { source: '/register-as-a-member', destination: '/connect/membership', permanent: true },
      { source: '/contact-us', destination: '/connect/contact', permanent: true },
      { source: '/so-you-want-to-be-a-christian', destination: '/connect/next-steps', permanent: true },
      { source: '/take-a-step-of-faith', destination: '/connect/next-steps', permanent: true },
      { source: '/get-connected', destination: '/connect', permanent: true },
      // Ministries — most slugs carried over unchanged already; only the
      // renamed one needs a real redirect, the rest are harmless no-ops.
      { source: '/ministries/ablaze-ministry', destination: '/ministries/ablaze-youth', permanent: true },
      // Events/sermons moved under new URL prefixes.
      { source: '/events/:slug', destination: '/programmes/:slug', permanent: true },
      { source: '/sermons/you-can-try', destination: '/media/sermons', permanent: true },
      { source: '/sermons/:slug', destination: '/media/sermons/:slug', permanent: true },
      // ---- The church's real live WordPress site (cityofgodchristiancentre.org) ----
      // Taken from its own sitemap (wp-sitemap.xml), so links people already have
      // keep working once this site takes over the domain. Specific rules come
      // before the generic /sermons/:slug one.
      { source: '/sermon', destination: '/media/sermons', permanent: true },
      { source: '/categories', destination: '/media/sermons', permanent: true },
      { source: '/give-online', destination: '/give', permanent: true },
      { source: '/giving-2', destination: '/give', permanent: true },
      { source: '/donation-confirmation', destination: '/give', permanent: true },
      { source: '/donation-confirmation-2', destination: '/give', permanent: true },
      { source: '/donation-failed', destination: '/give', permanent: true },
      { source: '/donation-failed-2', destination: '/give', permanent: true },
      { source: '/donation-history', destination: '/give/manage', permanent: true },
      { source: '/donation-history-2', destination: '/give/manage', permanent: true },
      { source: '/donor-dashboard', destination: '/give/manage', permanent: true },
      { source: '/donations/ncl', destination: '/give/donate', permanent: true },
      { source: '/donations/coglondon', destination: '/give/donate', permanent: true },
      { source: '/donations/mbr', destination: '/give/donate', permanent: true },
      { source: '/watch-live', destination: '/media/cog-tv', permanent: true },
      { source: '/groups', destination: '/connect/homegroups', permanent: true },
      { source: '/ablaze', destination: '/ministries/ablaze-youth', permanent: true },
      { source: '/men', destination: '/ministries/mens-ministry', permanent: true },
      { source: '/mens-ministry', destination: '/ministries/mens-ministry', permanent: true },
      { source: '/women', destination: '/ministries/womens-ministry', permanent: true },
      { source: '/women-ministry', destination: '/ministries/womens-ministry', permanent: true },
      { source: '/teens', destination: '/ministries/teens-ministry', permanent: true },
      { source: '/children', destination: '/ministries/childrens-ministry', permanent: true },
      { source: '/children-ministry', destination: '/ministries/childrens-ministry', permanent: true },
      { source: '/rising-stars', destination: '/ministries', permanent: true },
      { source: '/meet-the-team', destination: '/about/leadership', permanent: true },
      { source: '/foodbank', destination: '/connect/welfare', permanent: true },
      { source: '/getting-church-support', destination: '/connect/welfare', permanent: true },
      { source: '/new-member', destination: '/connect/membership', permanent: true },
      { source: '/events', destination: '/programmes', permanent: true },
      { source: '/prayer-rally', destination: '/programmes', permanent: true },
      { source: '/wcc2022', destination: '/programmes', permanent: true },
      { source: '/hallelujah-night', destination: '/programmes', permanent: true },
      { source: '/join-us-for-the-world-changers-conference-2024-open-doors-awaits', destination: '/programmes', permanent: true },
      { source: '/join-us-for-the-world-changers-conference-2024-open-doors-awaits-2', destination: '/programmes', permanent: true },
      { source: '/shop', destination: '/give/bookstore', permanent: true },
      { source: '/basket', destination: '/give/bookstore', permanent: true },
      { source: '/checkout', destination: '/give/bookstore', permanent: true },
      { source: '/my-account', destination: '/give/bookstore', permanent: true },
      // Their own sites (same addresses as the Branches menu).
      { source: '/sunderland-church', destination: 'https://cityofgodsunderland.org/', permanent: true },
      { source: '/london-church', destination: 'https://cityofgodlondon.org/', permanent: true },
      { source: '/middlesbrough-church', destination: 'https://cityofgodmiddlesbrough.org/', permanent: true },
      // Blog-style posts — real content worth porting properly later, but
      // redirected to the closest hub for now rather than 404ing.
      { source: '/hello-world', destination: '/', permanent: true },
      { source: '/walking-by-faith-not-by-sight', destination: '/media/sermons', permanent: true },
      { source: '/30-day-bible-reading-plan-the-gospel-of-john', destination: '/resources', permanent: true },
      { source: '/finding-peace-in-seasons-of-anxiety', destination: '/resources', permanent: true },
      { source: '/what-is-the-gospel-in-plain-language', destination: '/resources', permanent: true },
      { source: '/new-here-heres-what-to-expect-at-church', destination: '/connect/new-here', permanent: true },
      { source: '/you-dont-need-to-have-it-all-figured-out', destination: '/resources', permanent: true },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
