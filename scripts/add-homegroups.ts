// One-off: adds the homegroups that are on the church's own sign-up form (the Google "New Member
// Form") but missing from the site. Run via `npx payload run scripts/add-homegroups.ts`.
//
// Add-only and safe to re-run: a group is created only if no homegroup already has that area
// (ignoring case, spacing and "/" versus " / "). Nothing is edited or deleted. Leader and meeting
// day are left empty on purpose: the form does not say, and the admin "To complete" panel lists
// groups with no leader until someone fills them in.
//
// Against production, set NODE_ENV=production first (see the project notes), or Payload treats the
// database as a dev database.

import { getPayload } from 'payload'

import config from '../src/payload.config'

const MISSING = ['Blakelaw', 'City Centre 1', 'City Centre 2', 'Gosforth/Regent Centre/Fawdon', 'Heaton', 'Walker 2']

const normalise = (value: string) => value.toLowerCase().replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ').trim()

try {
  // The host only, never the credentials, so it is clear which database this is.
  console.log('Database host:', new URL(process.env.DATABASE_URI ?? '').hostname || '(unknown)')
} catch {
  console.log('Database host: (could not read)')
}

const payload = await getPayload({ config })

const existing = await payload.find({ collection: 'homegroups', limit: 200, depth: 0, pagination: false })
const have = new Set(existing.docs.flatMap((g) => [normalise(g.area), normalise(g.name.replace(/\s*homegroup$/i, ''))]))
console.log(`Homegroups before: ${existing.totalDocs}`)

let created = 0
for (const area of MISSING) {
  if (have.has(normalise(area))) {
    console.log(`Skipped ${area}: already there.`)
    continue
  }
  await payload.create({ collection: 'homegroups', data: { name: `${area} Homegroup`, area } })
  console.log(`Added ${area}`)
  created++
}

const after = await payload.find({ collection: 'homegroups', limit: 200, depth: 0, pagination: false, sort: 'area' })
console.log(`Added ${created}. Homegroups now: ${after.totalDocs}`)
console.log(after.docs.map((g) => g.area).join(' | '))
