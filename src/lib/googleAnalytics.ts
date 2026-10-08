import crypto from 'node:crypto'

import { bucketOf, share, type Analytics, type Table } from './analytics'

// Website traffic for the admin, read from Google Analytics 4 with a read-only "service account".
// It switches on by itself once these two settings exist in Vercel:
//   GA4_PROPERTY_ID               the number from Google Analytics, Admin, Property details
//   GOOGLE_SERVICE_ACCOUNT_JSON   the whole contents of the service account's JSON key file
// Nothing is sent to Google except the report requests, and the key never reaches the browser.
//
// Google Analytics only counts visitors who accepted cookies on the site, so real visits are higher.

export const gaConfigured = () => Boolean(process.env.GA4_PROPERTY_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON)

export type Traffic =
  | {
      ok: true
      headline: { visitors: number; newVisitors: number; sessions: number; pageViews: number; engagementPercent: number; avgSeconds: number }
      /** Sessions per chart period, in the same order as the analytics buckets. */
      sessionsSeries: number[]
      tables: Record<string, Table>
    }
  | { ok: false; reason: 'not-configured' | 'error'; message?: string; hint?: string }

// The two addresses can be pointed at a stand-in server when testing; in real use they are Google's.
const TOKEN_URL = process.env.GA_TOKEN_URL ?? 'https://oauth2.googleapis.com/token'
const API_BASE = process.env.GA_API_BASE ?? 'https://analyticsdata.googleapis.com'
let cachedToken: { token: string; expires: number } | null = null

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.token
  const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON as string) as { client_email: string; private_key: string }
  const now = Math.floor(Date.now() / 1000)
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  })}`
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(key.private_key).toString('base64url')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
    cache: 'no-store',
  })
  if (!res.ok) throw new GaError(`Google would not accept the service account key (${res.status}).`, 'Check that GOOGLE_SERVICE_ACCOUNT_JSON holds the whole key file, unchanged.')
  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 }
  return cachedToken.token
}

class GaError extends Error {
  constructor(
    message: string,
    public hint?: string,
  ) {
    super(message)
  }
}

type GaReport = { dimensionHeaders?: { name: string }[]; metricHeaders?: { name: string }[]; rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[] }

async function batch(requests: object[], range: { startDate: string; endDate: string }): Promise<GaReport[]> {
  const token = await accessToken()
  const res = await fetch(`${API_BASE}/v1beta/properties/${process.env.GA4_PROPERTY_ID}:batchRunReports`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: requests.map((r) => ({ ...r, dateRanges: [range] })) }),
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string; status?: string } } | null
    const detail = body?.error?.message ?? `status ${res.status}`
    let hint: string | undefined
    if (res.status === 403 && /has not been used|disabled/i.test(detail)) hint = 'Switch on the "Google Analytics Data API" for the Google Cloud project that owns the service account.'
    else if (res.status === 403) hint = 'In Google Analytics, Admin, Property access management, add the service account\'s email address as a Viewer.'
    else if (res.status === 400 || res.status === 404) hint = 'Check GA4_PROPERTY_ID: it is the number in Google Analytics, Admin, Property details (not the G-… measurement ID).'
    throw new GaError(`Google Analytics said: ${detail}`, hint)
  }
  const data = (await res.json()) as { reports?: GaReport[] }
  return data.reports ?? []
}

const num = (v: string | undefined) => Number(v ?? 0) || 0
const rowsOf = (r: GaReport | undefined) => r?.rows ?? []

const CACHE_MS = 15 * 60 * 1000
const cache = new Map<string, { at: number; value: Traffic }>()

/** Visitors, page views, top pages, sources, countries and devices for the same period as the analytics page. */
export async function getTraffic(a: Pick<Analytics, 'fromKey' | 'toKey' | 'granularity' | 'buckets'>): Promise<Traffic> {
  if (!gaConfigured()) return { ok: false, reason: 'not-configured' }
  const cacheKey = `${a.fromKey}|${a.toKey}|${a.granularity}`
  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value

  let value: Traffic
  try {
    const range = { startDate: a.fromKey, endDate: a.toKey }
    const [totals, series, pages, channels, countries, devices] = [
      ...(await batch(
        [
          { metrics: ['activeUsers', 'newUsers', 'sessions', 'screenPageViews', 'engagementRate', 'averageSessionDuration'].map((name) => ({ name })) },
          { dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }], limit: 1000 },
          { dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 12 },
          { dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 10 },
          { dimensions: [{ name: 'country' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }], orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 10 },
        ],
        range,
      )),
      ...(await batch([{ dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] }], range)),
    ]

    const t = rowsOf(totals)[0]?.metricValues?.map((m) => m.value) ?? []
    const index = new Map(a.buckets.map((b, i) => [b.key, i]))
    const sessionsSeries = a.buckets.map(() => 0)
    const viewsSeries = a.buckets.map(() => 0)
    for (const r of rowsOf(series)) {
      const d = r.dimensionValues?.[0]?.value ?? ''
      const day = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
      const i = index.get(bucketOf(day, a.granularity))
      if (i === undefined) continue
      sessionsSeries[i] += num(r.metricValues?.[0]?.value)
      viewsSeries[i] += num(r.metricValues?.[1]?.value)
    }

    const sessionTotal = rowsOf(channels).reduce((n, r) => n + num(r.metricValues?.[0]?.value), 0)
    const deviceTotal = rowsOf(devices).reduce((n, r) => n + num(r.metricValues?.[0]?.value), 0)
    const tables: Record<string, Table> = {
      'traffic-by-period': {
        title: `Website traffic by ${a.granularity}`,
        headers: [a.granularity === 'day' ? 'Day' : a.granularity === 'week' ? 'Week starting' : 'Month', 'Sessions', 'Page views'],
        formats: ['text', 'int', 'int'],
        rows: a.buckets.map((b, i) => [b.key, sessionsSeries[i], viewsSeries[i]]),
      },
      'top-pages': {
        title: 'Most viewed pages',
        headers: ['Page', 'Views', 'Visitors'],
        formats: ['text', 'int', 'int'],
        rows: rowsOf(pages).map((r) => [r.dimensionValues?.[0]?.value ?? '', num(r.metricValues?.[0]?.value), num(r.metricValues?.[1]?.value)]),
      },
      'traffic-sources': {
        title: 'Where visitors come from',
        note: 'Google Analytics groups traffic into channels, such as Direct (typed the address), Organic Search, Social and Referral (a link on another site).',
        headers: ['Channel', 'Sessions', 'Visitors', 'Share of sessions'],
        formats: ['text', 'int', 'int', 'percent'],
        rows: rowsOf(channels).map((r) => [r.dimensionValues?.[0]?.value ?? '', num(r.metricValues?.[0]?.value), num(r.metricValues?.[1]?.value), share(num(r.metricValues?.[0]?.value), sessionTotal)]),
      },
      'visitor-countries': {
        title: 'Visitors by country',
        headers: ['Country', 'Visitors', 'Sessions'],
        formats: ['text', 'int', 'int'],
        rows: rowsOf(countries).map((r) => [r.dimensionValues?.[0]?.value ?? '', num(r.metricValues?.[0]?.value), num(r.metricValues?.[1]?.value)]),
      },
      devices: {
        title: 'Phones, tablets and computers',
        headers: ['Device', 'Sessions', 'Share of sessions'],
        formats: ['text', 'int', 'percent'],
        rows: rowsOf(devices).map((r) => [r.dimensionValues?.[0]?.value ?? '', num(r.metricValues?.[0]?.value), share(num(r.metricValues?.[0]?.value), deviceTotal)]),
      },
    }

    value = {
      ok: true,
      headline: {
        visitors: num(t[0]),
        newVisitors: num(t[1]),
        sessions: num(t[2]),
        pageViews: num(t[3]),
        engagementPercent: Math.round(num(t[4]) * 1000) / 10,
        avgSeconds: Math.round(num(t[5])),
      },
      sessionsSeries,
      tables,
    }
  } catch (err) {
    value = {
      ok: false,
      reason: 'error',
      message: err instanceof GaError ? err.message : 'Could not read Google Analytics just now.',
      hint: err instanceof GaError ? err.hint : 'Check GOOGLE_SERVICE_ACCOUNT_JSON is the complete key file (valid JSON).',
    }
    // A failure is not kept for long, so fixing the setting shows straight away.
    cache.set(cacheKey, { at: Date.now() - CACHE_MS + 30_000, value })
    return value
  }
  cache.set(cacheKey, { at: Date.now(), value })
  return value
}
