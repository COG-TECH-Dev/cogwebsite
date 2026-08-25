import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Ministries } from './collections/Ministries'
import { Events } from './collections/Events'
import { Sermons } from './collections/Sermons'
import { MediaGalleryItems } from './collections/MediaGalleryItems'
import { Resources } from './collections/Resources'
import { Testimonials } from './collections/Testimonials'
import { BookstoreItems } from './collections/BookstoreItems'
import { PrayerRequests } from './collections/PrayerRequests'
import { FormSubmissions } from './collections/FormSubmissions'
import { Settings } from './globals/Settings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — City of God Christian Centre',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Pages,
    Ministries,
    Events,
    Sermons,
    MediaGalleryItems,
    Resources,
    Testimonials,
    BookstoreItems,
    PrayerRequests,
    FormSubmissions,
  ],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  // Without SMTP_HOST set, Payload falls back to logging emails to the
  // console (already the case today) — nothing breaks, notifications just
  // won't actually send until SMTP is configured for this environment.
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM_EMAIL || 'no-reply@cityofgodchristiancentre.org',
        defaultFromName: process.env.SMTP_FROM_NAME || 'City of God Christian Centre',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        },
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
})
