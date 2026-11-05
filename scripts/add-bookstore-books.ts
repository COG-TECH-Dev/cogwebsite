// One-off: adds Training for Ministry to the Bookstore (Resources menu), £10, to be ordered with the form and collected at
// church. Run via `npx payload run scripts/add-bookstore-books.ts`. (It first also added a placeholder for the Apostle's
// book; his three real titles are now added by scripts/add-apostle-books.ts instead.)
//
// Add-only and safe to re-run: a book is created only if no bookstore item already has that title (ignoring case).
// Nothing is edited or deleted. The Training for Ministry author, cover picture and description are added in the admin
// (Bookstore Items).
//
// Against production, set NODE_ENV=production first (see the project notes), or Payload treats the database as a dev database.

import { getPayload } from 'payload'

import config from '../src/payload.config'

const BOOKS = [
  { title: 'Training for Ministry', author: undefined, priceDisplay: '£10' },
]

try {
  // The host only, never the credentials, so it is clear which database this is.
  console.log('Database host:', new URL(process.env.DATABASE_URI ?? '').hostname || '(unknown)')
} catch {
  console.log('Database host: (could not read)')
}

const payload = await getPayload({ config })
const existing = await payload.find({ collection: 'bookstore-items', limit: 200, depth: 0, pagination: false })
const have = new Set(existing.docs.map((b) => b.title.trim().toLowerCase()))
console.log(`Bookstore items before: ${existing.totalDocs}`)

let added = 0
for (const book of BOOKS) {
  if (have.has(book.title.toLowerCase())) {
    console.log(`Skipped ${book.title}: already there.`)
    continue
  }
  await payload.create({ collection: 'bookstore-items', data: book })
  added++
  console.log(`Added ${book.title} (${book.priceDisplay})`)
}
console.log(added === 0 ? 'Nothing to add.' : `Done: ${added} book(s) added. Add the cover in the admin.`)
process.exit(0)
