// One-off: adds 8 placeholder ministries so the directory reaches the BRD's
// "15+ ministry groups" target (FR-004/BO-02). Each is real, non-overlapping
// content for a typical Pentecostal/charismatic church of this kind, but the
// specifics (leader, meeting times, photo) are intentionally left blank for
// the church office to fill in via /admin -> Content -> Ministries.
// All created with featured: false, so none jump onto the homepage highlight
// cards uninvited — only the full /ministries directory shows them until a
// Content Editor chooses to feature one.
// Safe to re-run — skips any ministry whose name already exists.
// Run via `npx payload run scripts/seed-more-ministries.ts`.

import { getPayload } from 'payload'
import config from '../src/payload.config'
import { slugify } from '../src/hooks/formatSlug'
import type { Ministry } from '../src/payload-types'

const richText = (text: string): Ministry['description'] => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textStyle: '',
        textFormat: 0,
        children: [
          { mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 },
        ],
      },
    ],
  },
})

const NEW_MINISTRIES = [
  {
    name: 'Choir & Praise Ministry',
    summary: "Leading the congregation into God's presence through anointed praise and worship.",
    description:
      'The Choir & Praise Ministry leads the church in worship during services and special programmes, using music to usher the congregation into the presence of God.',
  },
  {
    name: 'Ushering & Protocol Ministry',
    summary: 'Welcoming every visitor and member with warmth and helping every service run smoothly.',
    description:
      'The Ushering & Protocol Ministry welcomes everyone who walks through our doors, manages seating and offerings, and helps every service run smoothly from start to finish.',
  },
  {
    name: 'Evangelism & Outreach Ministry',
    summary: 'Taking the gospel beyond our walls into the community through outreach and evangelism.',
    description:
      'The Evangelism & Outreach Ministry shares the gospel in our local community through street evangelism, door-to-door visits, and community outreach events.',
  },
  {
    name: 'Welfare & Benevolence Ministry',
    summary: 'Caring practically for members and the community in times of need.',
    description:
      'The Welfare & Benevolence Ministry provides practical and pastoral support to members and the wider community facing hardship, including food, financial assistance, and visitation.',
  },
  {
    name: 'Hospitality Ministry',
    summary: 'Serving refreshments and creating a warm, welcoming atmosphere at every gathering.',
    description:
      'The Hospitality Ministry serves refreshments and looks after the comfort of members and visitors at services, programmes, and events.',
  },
  {
    name: 'Sound & Technical Ministry',
    summary: 'Running the sound, lighting, and technical setup behind every service.',
    description:
      'The Sound & Technical Ministry manages the sound, lighting, and equipment that support every service and event, working behind the scenes to keep everything running smoothly.',
  },
  {
    name: 'Marriage & Family Life Ministry',
    summary: 'Strengthening marriages and family relationships through teaching and counsel.',
    description:
      'The Marriage & Family Life Ministry supports couples and families through premarital and marital counselling, teaching, and fellowship events.',
  },
  {
    name: 'Missions Ministry',
    summary: 'Supporting church planting and missionary work beyond our local community.',
    description:
      'The Missions Ministry supports church planting, missionary partners, and gospel outreach beyond our local community, both nationally and internationally.',
  },
]

const payload = await getPayload({ config })

for (const m of NEW_MINISTRIES) {
  const existing = await payload.find({ collection: 'ministries', where: { name: { equals: m.name } }, limit: 1 })
  if (existing.docs[0]) {
    console.log(`Skipped "${m.name}": already exists.`)
    continue
  }

  await payload.create({
    collection: 'ministries',
    data: {
      name: m.name,
      slug: slugify(m.name),
      summary: m.summary,
      description: richText(m.description),
      featured: false,
    },
  })
  console.log(`Created "${m.name}".`)
}

console.log('Done.')
process.exit(0)
