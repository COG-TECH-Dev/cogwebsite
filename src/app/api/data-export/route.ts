import type { Where } from 'payload'

import { csvResponse } from '@/lib/csv'
import { DATA_EXPORTS, rangeConditions } from '@/lib/dataExports'
import { getPayloadClient } from '@/lib/payload'

// Never cache — this returns personal data.
export const dynamic = 'force-dynamic'

// Admin-only CSV export of everything submitted through the site's forms.
// Reached from the "Download data" panel on the /admin dashboard (it shares
// the admin session cookie, so no separate login). Query params:
//   type  one of the keys in DATA_EXPORTS (required)
//   from  YYYY-MM-DD, optional — earliest submission date
//   to    YYYY-MM-DD, optional — latest submission date (inclusive)

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export async function GET(request: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = new URL(request.url)
  const type = url.searchParams.get('type') ?? ''
  const config = DATA_EXPORTS[type]
  if (!config) {
    return new Response(`Unknown export type. Use one of: ${Object.keys(DATA_EXPORTS).join(', ')}`, { status: 400 })
  }

  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const range = { from: from && DATE_ONLY.test(from) ? from : undefined, to: to && DATE_ONLY.test(to) ? to : undefined }
  // A summary lists every row and uses the dates to narrow its counts; anything else is filtered by date.
  const conditions: Where[] = config.summary ? [] : rangeConditions(range, config.dateField)

  const result = await payload.find({
    collection: config.collection,
    where: conditions.length > 0 ? { and: conditions } : undefined,
    sort: config.sort ?? '-createdAt',
    depth: 1,
    pagination: false,
    user,
    overrideAccess: false,
  })

  let docs = result.docs as unknown as Record<string, unknown>[]
  if (config.enrich) docs = await config.enrich(docs, payload, range)

  return csvResponse(
    `${type}-${new Date().toISOString().slice(0, 10)}.csv`,
    config.columns.map(([header]) => header),
    docs.map((doc) => config.columns.map(([, get]) => get(doc))),
  )
}
