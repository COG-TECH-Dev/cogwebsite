import type { Where } from 'payload'

import { getPayloadClient } from '@/lib/payload'

// Admin-only CSV export of Gift Aid-eligible donations, for the church's
// finance team to hand into HMRC's Charities Online small-claims form.
// Visit this URL directly in a browser tab while logged into /admin — it
// shares the same session cookie, no separate login needed.
// Optional ?from=YYYY-MM-DD&to=YYYY-MM-DD to narrow the date range (matched
// against paidAt); omit both for everything on record.
//
// Note: this isn't a byte-for-byte HMRC template (their schema wants title/
// first/last name split out; we only capture one free-text name field) —
// it's a clean working export with everything needed to fill that template
// in quickly.
function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export async function GET(request: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = new URL(request.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  const conditions: Where[] = [
    { status: { equals: 'completed' } },
    { 'giftAid.declared': { equals: true } },
  ]
  if (from) conditions.push({ paidAt: { greater_than_equal: from } })
  if (to) conditions.push({ paidAt: { less_than_equal: to } })

  const result = await payload.find({
    collection: 'donations',
    where: { and: conditions },
    sort: 'paidAt',
    limit: 5000,
  })

  const header = ['Donor Name', 'Address', 'Postcode', 'Date Paid', 'Amount (GBP)', 'Fund']
  const rows = result.docs.map((d) => [
    d.giftAid?.fullName || d.donorName,
    d.giftAid?.address || '',
    d.giftAid?.postcode || '',
    d.paidAt ? new Date(d.paidAt).toISOString().slice(0, 10) : '',
    (d.amount / 100).toFixed(2),
    d.fund,
  ])

  const csv = [header, ...rows].map((row) => row.map((cell) => csvEscape(String(cell))).join(',')).join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="gift-aid-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
