import type { Where } from 'payload'

import { DATA_EXPORTS } from '@/lib/dataExports'
import { getPayloadClient } from '@/lib/payload'

// Never cache — this returns personal data.
export const dynamic = 'force-dynamic'

// Admin-only CSV export of everything submitted through the site's forms.
// Reached from the "Download data" panel on the /admin dashboard (it shares
// the admin session cookie, so no separate login). Query params:
//   type  one of the keys in DATA_EXPORTS (required)
//   from  YYYY-MM-DD, optional — earliest submission date
//   to    YYYY-MM-DD, optional — latest submission date (inclusive)

// Text typed into a public form ends up in these cells, and spreadsheets treat
// a cell beginning with = + - @ as a formula — so someone could submit a
// "message" that runs when an admin opens the CSV. Prefix those with an
// apostrophe, but leave plain phone numbers / numbers alone (a number like
// +44 7700 900123 is not a formula, and mangling it would be annoying).
function cell(value: unknown): string {
  let s = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (/^[=+\-@\t\r]/.test(s) && !/^[+-]?[\d\s().-]+$/.test(s)) s = `'${s}`
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

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
  const conditions: Where[] = []
  if (from && DATE_ONLY.test(from)) conditions.push({ createdAt: { greater_than_equal: `${from}T00:00:00.000Z` } })
  if (to && DATE_ONLY.test(to)) conditions.push({ createdAt: { less_than_equal: `${to}T23:59:59.999Z` } })

  const result = await payload.find({
    collection: config.collection,
    where: conditions.length > 0 ? { and: conditions } : undefined,
    sort: '-createdAt',
    depth: 1,
    pagination: false,
    user,
    overrideAccess: false,
  })

  const docs = result.docs as unknown as Record<string, unknown>[]
  const lines = [
    config.columns.map(([header]) => cell(header)).join(','),
    ...docs.map((doc) => config.columns.map(([, get]) => cell(get(doc))).join(',')),
  ]

  // Leading BOM so Excel reads the file as UTF-8 (names/accents stay intact).
  return new Response(`﻿${lines.join('\r\n')}\r\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
