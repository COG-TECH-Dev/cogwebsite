// One-off: the Giving global already existed before the `funds` field was
// added, so Payload's field-level defaultValue never applied to it (that
// only fires for brand-new documents). Backfills the same 4 default funds
// used in the schema's defaultValue. Safe to re-run — skips if funds already
// has entries, so it never overwrites real fund names someone's since added.
// Run via `npx payload run scripts/backfill-giving-funds.ts`.

import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })

const giving = await payload.findGlobal({ slug: 'giving' })

if (giving.funds && giving.funds.length > 0) {
  console.log(`Skipped: funds already has ${giving.funds.length} entries.`)
} else {
  await payload.updateGlobal({
    slug: 'giving',
    data: {
      funds: [
        { name: 'General Fund / Tithe', description: 'Support the ongoing ministry and operations of the church.' },
        { name: 'Missions', description: 'Support our missionary partners and outreach beyond our community.' },
        { name: 'Building Fund', description: 'Help us build a house of worship for the next generation.' },
        { name: 'Benevolence', description: 'Support members and the community facing financial hardship.' },
      ],
    },
  })
  console.log('Backfilled 4 default funds.')
}

process.exit(0)
