// One-off: adds four more tenets of faith to the Tenets page: the Great Commission, Marriage, Tithing/Giving/Offerings and
// Christian Service (the church's own wording, reworded and given more detail). Run via
// `npx payload run scripts/add-tenets-of-faith.ts`.
//
// Add-only and safe to re-run: a tenet is added only if no card with that title is already on the page, and the existing
// cards are left exactly as they are. The only other change is the intro sentence ("These eight convictions...") so it
// counts the cards on the page. The page is not republished or unpublished; it stays as it is.
//
// Against production, set NODE_ENV=production first (see the project notes), or Payload treats the database as a dev database.

import { getPayload } from 'payload'

import config from '../src/payload.config'

const NEW_TENETS = [
  {
    title: 'The Great Commission',
    icon: 'globe',
    body: 'We believe Jesus commands every believer to go and preach the gospel, to win the lost and to make disciples of all nations, baptising them and teaching them to obey all that He has commanded. Evangelism and discipleship are the work of the whole church, and Christ has promised to be with us as we go.',
    footnote: 'Matthew 28:19–20; Mark 16:15',
  },
  {
    title: 'Marriage',
    icon: 'users',
    body: "We believe marriage was ordained by God as the union of a man and a woman, in which the two leave their parents and become one flesh. We honour marriage as God's gift and design, and we are committed to supporting couples and families through the teaching of His Word, prayer and pastoral care.",
    footnote: 'Genesis 2:24; Matthew 19:4–6',
  },
  {
    title: 'Tithing, Giving and Offerings',
    icon: 'prayer',
    body: 'We believe in honouring God with our finances. The tithe, a tenth of our income, belongs to the Lord and is brought to the house of God, and we give offerings freely and cheerfully beyond it. God promises to open the windows of heaven and pour out His blessing on those who are faithful in their giving.',
    footnote: 'Malachi 3:8–12; 2 Corinthians 9:7',
  },
  {
    title: 'Christian Service',
    icon: 'handshake',
    body: 'We believe every believer is called to serve the Lord Jesus Christ. God has given each of us gifts and abilities, and He calls us to use them, according to the capacity He gives, to build up the church and bless others. We encourage every member to find a place to serve.',
    footnote: '1 Peter 4:10; Romans 12:4–8',
  },
] as const

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']

try {
  // The host only, never the credentials, so it is clear which database this is.
  console.log('Database host:', new URL(process.env.DATABASE_URI ?? '').hostname || '(unknown)')
} catch {
  console.log('Database host: (could not read)')
}

const payload = await getPayload({ config })

const result = await payload.find({ collection: 'pages', where: { slug: { equals: 'tenets' } }, limit: 1, depth: 0 })
const page = result.docs[0]
if (!page) {
  console.log('The Tenets page was not found; nothing changed.')
  process.exit(0)
}

const layout = JSON.parse(JSON.stringify(page.layout ?? [])) as { blockType: string; items?: { title: string; body: string; icon?: string; footnote?: string }[]; intro?: string }[]
const grid = layout.find((b) => b.blockType === 'cardGrid' && b.items?.some((i) => /scriptures/i.test(i.title)))
if (!grid || !grid.items) {
  console.log('The list of tenets was not found on the page; nothing changed.')
  process.exit(0)
}

const have = new Set(grid.items.map((i) => i.title.trim().toLowerCase()))
console.log(`Tenets before: ${grid.items.length}`)
let added = 0
for (const tenet of NEW_TENETS) {
  if (have.has(tenet.title.toLowerCase())) {
    console.log(`Skipped ${tenet.title}: already there.`)
    continue
  }
  grid.items.push({ title: tenet.title, body: tenet.body, icon: tenet.icon, footnote: tenet.footnote })
  added++
  console.log(`Added ${tenet.title}`)
}

// Keep the intro's count in step with the cards ("These eight convictions..." -> "These twelve convictions...").
const word = NUMBER_WORDS[grid.items.length] ?? String(grid.items.length)
const introBefore = grid.intro
if (grid.intro) grid.intro = grid.intro.replace(/\bThese\s+\w+\s+convictions\b/i, `These ${word} convictions`)
const introChanged = grid.intro !== introBefore

if (added === 0 && !introChanged) {
  console.log('Nothing to change.')
  process.exit(0)
}

await payload.update({ collection: 'pages', id: page.id, data: { layout: layout as never } })
console.log(`Tenets after: ${grid.items.length}. Intro now says: "${grid.intro ?? ''}"`)
console.log('Done.')
process.exit(0)
