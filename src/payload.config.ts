import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Ministries } from './collections/Ministries'
import { Homegroups } from './collections/Homegroups'
import { Events } from './collections/Events'
import { EventRegistrations } from './collections/EventRegistrations'
import { Sermons } from './collections/Sermons'
import { MediaGalleryItems } from './collections/MediaGalleryItems'
import { Resources } from './collections/Resources'
import { Testimonials } from './collections/Testimonials'
import { BookstoreItems } from './collections/BookstoreItems'
import { ChildSafeguardingForms } from './collections/ChildSafeguardingForms'
import { Donations } from './collections/Donations'
import { PrayerRequests } from './collections/PrayerRequests'
import { FormSubmissions } from './collections/FormSubmissions'
import { Giving } from './globals/Giving'
import { Settings } from './globals/Settings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — City of God Christian Centre',
      icons: [{ url: '/images/cog-mark.png', type: 'image/png' }],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterLogin: ['/components/admin/PoweredBy#PoweredBy'],
      graphics: {
        Icon: '/components/admin/Icon#Icon',
        Logo: '/components/admin/Logo#Logo',
      },
    },
  },
  collections: [
    Users,
    Media,
    Pages,
    Ministries,
    Homegroups,
    Events,
    EventRegistrations,
    Sermons,
    MediaGalleryItems,
    Resources,
    Testimonials,
    BookstoreItems,
    ChildSafeguardingForms,
    Donations,
    PrayerRequests,
    FormSubmissions,
  ],
  globals: [Settings, Giving],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  // Without RESEND_API_KEY set, Payload falls back to logging emails to the
  // console (already the case today) — nothing breaks, notifications just
  // won't actually send until it's configured for this environment. Resend
  // sends over HTTPS rather than an SMTP socket, which is more reliable
  // from Vercel's serverless functions than raw SMTP.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@cityofgodchristiancentre.org',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'City of God Christian Centre',
      })
    : undefined,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Payload only auto-syncs the schema (push) when NODE_ENV !== 'production'
    // — see docker-compose.dev.yml, used for local development. In production
    // (docker-compose.yml), Payload instead runs these versioned migrations
    // automatically on startup (connect() checks NODE_ENV === 'production' &&
    // prodMigrations, see @payloadcms/db-postgres/dist/connect.js) — safe for
    // a database that already has real content, unlike a schema auto-diff.
    // Run `npm run migrate:create` after changing any collection/global to
    // generate a new migration, and commit the result.
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    // Falls back to local disk automatically when BLOB_READ_WRITE_TOKEN
    // isn't set (e.g. local dev via docker-compose.dev.yml) — required for
    // Vercel deployment, since serverless functions have no persistent disk.
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Without this, uploads go through a Vercel serverless function and
      // hit its hard 4.5MB request-body limit — easy to exceed with real
      // photos (a DSLR JPEG is routinely 5-15MB). With it, the browser
      // uploads the file straight to Vercel Blob and only a small
      // confirmation payload passes through the function.
      clientUploads: true,
    }),
  ],
})
