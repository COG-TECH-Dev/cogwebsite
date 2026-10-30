// One-off: gives the mission photo on the Vision & Mission page its bold caption, and makes the same words bold in the
// mission text (and writes "God's" with its apostrophe). Run via `npx payload run scripts/add-mission-caption.ts`.
//
// Safe to re-run: a section that already has the caption and the bold words is left alone.
//
// Against production, set NODE_ENV=production first (see the project notes), or Payload treats the database as a dev database.

import { getPayload } from 'payload'

import config from '../src/payload.config'

const CAPTION = "Preaching the integrity of God's word"
const PHRASE = /preaching the integrity of God['’]?s word/i

try {
  // The host only, never the credentials, so it is clear which database this is.
  console.log('Database host:', new URL(process.env.DATABASE_URI ?? '').hostname || '(unknown)')
} catch {
  console.log('Database host: (could not read)')
}

const payload = await getPayload({ config })
const pages = await payload.find({ collection: 'pages', limit: 200, depth: 0, pagination: false })

let changed = 0
for (const page of pages.docs) {
  let touched = false
  const layout = (page.layout ?? []).map((block) => {
    if (block.blockType !== 'splitFeature' || !block.body || !PHRASE.test(block.body)) return block
    const body = block.body.replace(/(\*\*)?preaching the integrity of God['’]?s word(\*\*)?/i, "**preaching the integrity of God's word**")
    if (body === block.body && block.imageCaption === CAPTION) return block
    touched = true
    return { ...block, body, imageCaption: CAPTION }
  })
  if (!touched) continue
  await payload.update({ collection: 'pages', id: page.id, data: { layout } })
  changed++
  console.log(`Caption and bold words added on: ${page.title}`)
}
console.log(changed === 0 ? 'Nothing to change.' : `Done: ${changed} page(s) updated.`)
process.exit(0)
