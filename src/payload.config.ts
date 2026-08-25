import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

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
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Payload only auto-syncs the DB schema to match the collections/globals
    // below when NODE_ENV !== 'production' (hard-coded in Payload itself,
    // `push: true` here can't override that) — see docker-compose.dev.yml
    // for local development. Before go-live, replace this with versioned
    // migrations (`payload migrate`) via `prodMigrations`, once the schema
    // is stable and there's real data that must never be dropped by an
    // auto-diff.
  }),
  sharp,
})
