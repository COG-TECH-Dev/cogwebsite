import { getAnalytics, isRange } from '@/lib/analytics'
import { csvResponse } from '@/lib/csv'
import { getPayloadClient } from '@/lib/payload'

// Never cache: this is the church's own figures.
export const dynamic = 'force-dynamic'

// Admin-only CSV of one table from the admin Analytics page. Reached from the "Download CSV" links there,
// so it shares the admin session cookie. Query params:
//   table  the table's id (see the Analytics page), required
//   range  30d | 90d | 12m | ytd | all (default 90d)
export async function GET(request: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = new URL(request.url)
  const rangeParam = url.searchParams.get('range')
  const range = isRange(rangeParam) ? rangeParam : '90d'
  const analytics = await getAnalytics(payload, range)

  const id = url.searchParams.get('table') ?? ''
  const table = analytics.tables[id]
  if (!table) {
    return new Response(`Unknown table. Use one of: ${Object.keys(analytics.tables).join(', ')}`, { status: 400 })
  }

  // Money is in pounds and shares are percentages, so say so in the column names.
  const headers = table.headers.map((h, i) => (table.formats[i] === 'money' ? `${h} (GBP)` : table.formats[i] === 'percent' ? `${h} (%)` : h))
  return csvResponse(`analytics-${id}-${range}-${new Date().toISOString().slice(0, 10)}.csv`, headers, table.rows)
}
