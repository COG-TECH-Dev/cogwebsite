// One-off: adds Apostle Bright Onoka's three books to the Bookstore (Resources menu), £10 each, to be ordered with the form
// and collected at church: You Are Called, Accessing Kingdom Wealth and Mind Your Conscience. Run via
// `npx payload run scripts/add-apostle-books.ts`.
//
// Safe to re-run. The placeholder "Apostle Bright Onoka's Book" (added earlier by scripts/add-bookstore-books.ts) is turned
// into the first real title, so it keeps its place; every other book is created only if no bookstore item already has that
// title (ignoring case). Books that are already there are left exactly as they are, so nothing edited in the admin is
// overwritten. Covers are added in the admin (Bookstore Items, Cover image): the pictures are in the book-covers folder.
//
// Against production, set NODE_ENV=production first (see the project notes), or Payload treats the database as a dev database.

import { getPayload } from 'payload'

import config from '../src/payload.config'

const AUTHOR = 'Apostle Bright Onoka'
const PRICE = '£10'
const PLACEHOLDER = "Apostle Bright Onoka's Book"

const BOOKS = [
  {
    title: 'You Are Called',
    description:
      'Understanding the phases of your assignment. Every believer has a ministry to fulfil: find out how to identify yours, the stages involved, and how to fulfil it.',
  },
  {
    title: 'Accessing Kingdom Wealth',
    description:
      'The seven misconceptions. The mistaken beliefs Christians hold about wealth, how they hold many back, and how to lay hold of the resources of heaven.',
  },
  {
    title: 'Mind Your Conscience',
    description:
      'How the conscience works, the different types of conscience, and how it can be exercised for a victorious Christian life.',
  },
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
let placeholder = existing.docs.find((b) => b.title.trim().toLowerCase() === PLACEHOLDER.toLowerCase())
console.log(`Bookstore items before: ${existing.totalDocs}`)

let changed = 0
for (const book of BOOKS) {
  if (have.has(book.title.toLowerCase())) {
    console.log(`Skipped ${book.title}: already there.`)
    continue
  }
  if (placeholder) {
    await payload.update({
      collection: 'bookstore-items',
      id: placeholder.id,
      data: { title: book.title, author: AUTHOR, description: book.description, priceDisplay: PRICE },
    })
    console.log(`Renamed the placeholder to ${book.title}`)
    placeholder = undefined
  } else {
    await payload.create({
      collection: 'bookstore-items',
      data: { title: book.title, author: AUTHOR, description: book.description, priceDisplay: PRICE },
    })
    console.log(`Added ${book.title} (${PRICE})`)
  }
  changed++
}
console.log(changed === 0 ? 'Nothing to change.' : `Done: ${changed} book(s) added. Add each cover in the admin (Bookstore Items).`)
process.exit(0)
