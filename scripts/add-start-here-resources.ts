// One-off: adds the "New to faith? Start here" pieces from scripts/start-here-content.ts as Resources of
// type "Start Here". Run via `npx payload run scripts/add-start-here-resources.ts`.
//
// RUN THIS ONLY AFTER THE CHURCH HAS APPROVED THE WORDING: resources have no draft state, so
// everything created here is public straight away (within a minute).
//
// Add-only and safe to re-run: a piece is created only if no resource already has its slug, and nothing
// is edited or deleted. Pieces are created in reading order, which is the order they are listed in.
//
// Against production, set NODE_ENV=production first (see the project notes), or Payload treats the
// database as a dev database.

import { getPayload } from 'payload'

import config from '../src/payload.config'
import { slugify } from '../src/hooks/formatSlug'
import type { Resource } from '../src/payload-types'
import { PIECES, type Block } from './start-here-content'

const text = (value: string) => ({ mode: 'normal', text: value, type: 'text', style: '', detail: 0, format: 0, version: 1 })
const base = { format: '', indent: 0, version: 1, direction: 'ltr' as const }

function node(block: Block) {
  if ('h' in block) return { type: 'heading', tag: 'h2', ...base, children: [text(block.h)] }
  if ('p' in block) return { type: 'paragraph', ...base, textStyle: '', textFormat: 0, children: [text(block.p)] }
  return {
    type: 'list',
    listType: 'bullet',
    start: 1,
    tag: 'ul',
    ...base,
    children: block.ul.map((item, i) => ({ type: 'listitem', value: i + 1, ...base, children: [text(item)] })),
  }
}

const body = (blocks: Block[]) => ({ root: { type: 'root', ...base, children: blocks.map(node) } }) as unknown as Resource['body']

try {
  // The host only, never the credentials, so it is clear which database this is.
  console.log('Database host:', new URL(process.env.DATABASE_URI ?? '').hostname || '(unknown)')
} catch {
  console.log('Database host: (could not read)')
}

const payload = await getPayload({ config })

let created = 0
for (const piece of PIECES) {
  const slug = slugify(piece.title)
  const existing = await payload.find({ collection: 'resources', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  if (existing.docs[0]) {
    console.log(`Skipped "${piece.title}": already there.`)
    continue
  }
  await payload.create({
    collection: 'resources',
    data: { title: piece.title, slug, type: 'start-here', body: body(piece.blocks), tags: piece.tags.map((tag) => ({ tag })) },
  })
  console.log(`Added "${piece.title}"`)
  created++
}

const all = await payload.find({ collection: 'resources', where: { type: { equals: 'start-here' } }, limit: 100, depth: 0, sort: 'createdAt' })
console.log(`Added ${created}. "Start Here" resources now: ${all.totalDocs}`)
console.log(all.docs.map((r) => r.title).join(' | '))
