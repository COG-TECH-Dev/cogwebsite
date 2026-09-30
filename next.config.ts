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
      { source: '/missions', destination: '/ministries/missions-ministry', permanent: true },
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
      { source: '/sermons/:slug', destination: '/media/sermons/:slug', permanent: true },
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
