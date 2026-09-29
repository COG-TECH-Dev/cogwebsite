// One-off: the Giving global already existed before the `funds` and
// `branches` fields were added, so Payload's field-level defaultValue never
// applied to it (that only fires for brand-new documents). Backfills the
// same defaults used in each field's schema defaultValue. Safe to re-run —
// skips either list that already has entries, so it never overwrites real
// names someone's since added in admin.
// Run via `npx payload run scripts/backfill-giving-defaults.ts`.

import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })

const giving = await payload.findGlobal({ slug: 'giving' })
const data: { funds?: typeof giving.funds; branches?: typeof giving.branches } = {}

if (giving.funds && giving.funds.length > 0) {
  console.log(`Skipped funds: already has ${giving.funds.length} entries.`)
} else {
  data.funds = [
    { name: 'General Fund / Tithe', description: 'Support the ongoing ministry and operations of the church.' },
    { name: 'Missions', description: 'Support our missionary partners and outreach beyond our community.' },
    { name: 'Building Fund', description: 'Help us build a house of worship for the next generation.' },
    { name: 'Benevolence', description: 'Support members and the community facing financial hardship.' },
  ]
}

if (giving.branches && giving.branches.length > 0) {
  console.log(`Skipped branches: already has ${giving.branches.length} entries.`)
} else {
  data.branches = [
    { name: 'Newcastle' },
    { name: 'Sunderland' },
    { name: 'London' },
    { name: 'Middlesbrough' },
    { name: 'Gateshead' },
  ]
}

if (Object.keys(data).length > 0) {
  await payload.updateGlobal({ slug: 'giving', data })
  console.log('Backfilled:', Object.keys(data).join(', '))
} else {
  console.log('Nothing to backfill.')
}

process.exit(0)
