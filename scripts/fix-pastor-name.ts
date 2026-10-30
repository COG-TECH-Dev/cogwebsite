// One-off: corrects the spelling of Pastor Ufumwen Onoka's name ("Ufunwen" -> "Ufumwen") wherever it appears in the
// pages (the Leadership page and the Newcastle card on the About page). Run via `npx payload run scripts/fix-pastor-name.ts`.
//
// Safe to re-run: pages without the old spelling are left alone. Only the text of the page content changes.
//
// Against production, set NODE_ENV=production first (see the project notes), or Payload treats the database as a dev database.

import { getPayload } from 'payload'

import config from '../src/payload.config'

const OLD = /Ufunwen/g
const NEW = 'Ufumwen'

try {
  // The host only, never the credentials, so it is clear which database this is.
  console.log('Database host:', new URL(process.env.DATABASE_URI ?? '').hostname || '(unknown)')
} catch {
  console.log('Database host: (could not read)')
}

const payload = await getPayload({ config })
const pages = await payload.find({ collection: 'pages', limit: 200, depth: 0, pagination: false })

let fixed = 0
for (const page of pages.docs) {
  const json = JSON.stringify({ title: page.title, subtitle: page.subtitle ?? null, layout: page.layout ?? [] })
  if (!OLD.test(json)) {
    OLD.lastIndex = 0
    continue
  }
  OLD.lastIndex = 0
  const next = JSON.parse(json.replace(OLD, NEW)) as { title: string; subtitle: string | null; layout: never }
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { title: next.title, ...(next.subtitle ? { subtitle: next.subtitle } : {}), layout: next.layout },
  })
  fixed++
  console.log(`Fixed the spelling on: ${page.title}`)
}
console.log(fixed === 0 ? 'Nothing to change.' : `Done: ${fixed} page(s) updated.`)
process.exit(0)
