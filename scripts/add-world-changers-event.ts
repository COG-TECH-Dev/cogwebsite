// One-off: adds the World Changers Conference 2026 (Wed 14 to Sun 18 October 2026) to Programmes & Events,
// published. Run via `npx payload run scripts/add-world-changers-event.ts`.
//
// Add-only and safe to re-run: nothing is created if an event with "World Changers" in its title already
// exists (published or draft), and nothing is edited or deleted. The flyer image, a registration link and
// the RSVP/volunteer options can be added afterwards in the admin (Events).
//
// Against production, set NODE_ENV=production first (see the project notes), or Payload treats the
// database as a dev database.

import { getPayload } from 'payload'

import config from '../src/payload.config'
import { slugify } from '../src/hooks/formatSlug'
import type { Event } from '../src/payload-types'

const TITLE = 'World Changers Conference 2026'

const text = (value: string, format = 0) => ({ mode: 'normal', text: value, type: 'text', style: '', detail: 0, format, version: 1 })
const base = { format: '', indent: 0, version: 1, direction: 'ltr' as const }
const para = (value: string, format = 0) => ({ type: 'paragraph', ...base, textStyle: '', textFormat: format, children: [text(value, format)] })
const heading = (value: string) => ({ type: 'heading', tag: 'h2', ...base, children: [text(value)] })
const list = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  ...base,
  children: items.map((item, i) => ({ type: 'listitem', value: i + 1, ...base, children: [text(item)] })),
})

const description = {
  root: {
    type: 'root',
    ...base,
    children: [
      heading('“Occupy till I come” — Luke 19:13'),
      para('Newcastle & the North East, this one is for YOU! 📣'),
      para(
        'For 5 powerful days, we are setting ourselves apart to seek God, hear His voice, receive fresh direction and be equipped to make an impact in our generation.',
      ),
      list(['Expect the move of God.', 'Expect the Word.', 'Expect worship.', 'Expect prayer.', 'Expect transformation.']),
      para('Expect to leave with fresh fire, fresh vision and a renewed passion for the assignment God has placed in your hands. 🔥'),
      para('Jesus said, “Occupy till I come.”'),
      list(['There is work to do.', 'There is a generation to reach.', 'There is a Kingdom to advance.']),
      para('And we are called to occupy! 🌍'),
      para(
        'Whether you’re in Newcastle, Gateshead, Sunderland, Durham, Northumberland or anywhere across the North East, make plans to be with us.',
      ),
      para('Come ready. Come hungry. Come expecting.'),
      para('5 DAYS. ONE GOD. ONE ASSIGNMENT. A GENERATION TO CHANGE. 🔥', 1),
    ],
  },
} as unknown as Event['description']

try {
  // The host only, never the credentials, so it is clear which database this is.
  console.log('Database host:', new URL(process.env.DATABASE_URI ?? '').hostname || '(unknown)')
} catch {
  console.log('Database host: (could not read)')
}

const payload = await getPayload({ config })

// Published or draft: draft: true returns the latest version of each event.
const existing = await payload.find({ collection: 'events', where: { title: { like: 'World Changers' } }, draft: true, limit: 5, depth: 0 })
if (existing.docs.length > 0) {
  console.log(`Skipped: found ${existing.docs.length} event(s) already: ${existing.docs.map((e) => `"${e.title}" (${e._status})`).join(', ')}`)
} else {
  const event = await payload.create({
    collection: 'events',
    draft: false,
    data: {
      title: TITLE,
      slug: slugify(TITLE),
      type: 'conference',
      startDate: '2026-10-14T00:00:00.000Z',
      endDate: '2026-10-18T00:00:00.000Z',
      timeLabel: 'Wed–Fri 7pm · Sat 6pm · Sun 10am',
      location: '25 Church Walk, Walker, Newcastle NE6 3DP',
      description,
      _status: 'published',
    },
  })
  console.log(`Added "${event.title}" (${event._status}) at /programmes/${event.slug}`)
}

// For information: the other events, in case one of them is the same conference (for example a draft "Annual Conference").
const all = await payload.find({ collection: 'events', draft: true, limit: 50, depth: 0, sort: 'startDate' })
console.log('Events now:', all.docs.map((e) => `${e.title} [${e._status}, ${String(e.startDate).slice(0, 10)}]`).join(' | '))
