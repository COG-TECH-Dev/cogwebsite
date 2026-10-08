import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'
import Link from 'next/link'

import { RANGES, formatCell, getAnalytics, isRange, type RangeKey, type Table } from '../../lib/analytics'
import { BarChart } from './BarChart'

const money = (n: number) => n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: n % 1 === 0 ? 0 : 2 })
const whole = (n: number) => n.toLocaleString('en-GB')

const card = {
  padding: 16,
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-m, 8px)',
  background: 'var(--theme-elevation-50)',
} as const

const sectionHeading = { margin: '32px 0 12px', fontSize: 20 } as const

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 13, opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.2, margin: '4px 0', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {note && <div style={{ fontSize: 12, opacity: 0.7 }}>{note}</div>}
    </div>
  )
}

function DataTable({ id, table, range }: { id: string; table: Table; range: RangeKey }) {
  return (
    <section style={{ ...card, marginBottom: 16, overflowX: 'auto' }} aria-labelledby={`t-${id}`}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <h3 id={`t-${id}`} style={{ margin: 0, fontSize: 16 }}>
          {table.title}
        </h3>
        <a href={`/api/analytics-export?table=${id}&range=${range}`} style={{ fontSize: 13 }}>
          Download CSV
        </a>
      </div>
      {table.note && <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>{table.note}</p>}
      {table.rows.length === 0 ? (
        <p style={{ margin: '12px 0 0', fontSize: 14, opacity: 0.7 }}>Nothing in this period.</p>
      ) : (
        <table style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              {table.headers.map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  style={{ textAlign: table.formats[i] === 'text' ? 'left' : 'right', padding: '6px 10px 6px 0', borderBottom: '1px solid var(--theme-elevation-150)', fontWeight: 600 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      textAlign: table.formats[ci] === 'text' ? 'left' : 'right',
                      padding: '6px 10px 6px 0',
                      borderBottom: '1px solid var(--theme-elevation-100)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatCell(cell, table.formats[ci])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

/**
 * The admin "Analytics" page (Admin / Super Admin only): headline numbers, charts over time and tables for
 * what people have done through the site. Counts and totals only, with a CSV download beside each table.
 */
export async function AnalyticsView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req } = initPageResult
  const user = req.user
  const allowed = user?.role === 'admin' || user?.role === 'super-admin'
  const raw = searchParams?.range
  const range: RangeKey = isRange(raw) ? raw : '90d'
  const a = allowed ? await getAnalytics(req.payload, range) : null
  const h = a?.headline
  const gaOn = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={user ?? undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1 style={{ margin: '16px 0 4px' }}>Analytics</h1>
        {!a || !h ? (
          <p>Only Admins can see the analytics.</p>
        ) : (
          <>
            <p style={{ margin: '0 0 16px', maxWidth: 720, opacity: 0.8, fontSize: 14 }}>
              What people have done through the website: form submissions, event sign-ups and online giving. These are
              counts and totals only. No names, messages or contact details appear on this page.
            </p>

            <nav aria-label="Time period" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {RANGES.map((r) => (
                <Link
                  key={r.value}
                  href={`/admin/analytics?range=${r.value}`}
                  aria-current={r.value === range ? 'true' : undefined}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: '1px solid var(--theme-elevation-200)',
                    textDecoration: 'none',
                    fontSize: 14,
                    background: r.value === range ? 'var(--theme-text)' : 'transparent',
                    color: r.value === range ? 'var(--theme-bg)' : 'var(--theme-text)',
                  }}
                >
                  {r.label}
                </Link>
              ))}
            </nav>
            <p style={{ margin: '0 0 20px', fontSize: 13, opacity: 0.7 }}>
              {a.rangeLabel}: {a.fromKey} to {a.toKey}
            </p>

            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
              <Stat label="People reaching out" value={whole(h.reachedOut)} note="Form submissions and prayer requests" />
              <Stat label="First-time visitors" value={whole(h.firstTimers)} />
              <Stat label="Prayer requests" value={whole(h.prayerRequests)} />
              <Stat label="Event sign-ups" value={whole(h.signupAttendees)} note="People attending, with guests" />
              <Stat label="Volunteers offered" value={whole(h.signupVolunteers)} />
              <Stat label="Total given" value={money(h.givingPounds)} note={`${whole(h.gifts)} gift${h.gifts === 1 ? '' : 's'}`} />
              <Stat label="Average gift" value={money(h.averageGiftPounds)} />
              <Stat label="Weekly and monthly giving" value={money(h.recurringPounds)} note={`${whole(h.recurringGivers)} regular giver${h.recurringGivers === 1 ? '' : 's'}`} />
              <Stat label="Gift Aid declared" value={`${h.giftAidShare}%`} note={`${money(h.giftAidPounds)} of gifts`} />
              <Stat
                label="Gifts completed"
                value={h.checkoutsStarted ? `${Math.round((h.checkoutsCompleted / h.checkoutsStarted) * 100)}%` : '–'}
                note={`${whole(h.checkoutsCompleted)} of ${whole(h.checkoutsStarted)} started`}
              />
              <Stat label="Gifts waiting to start" value={whole(h.scheduledGifts)} note="Regular gifts set up with a later start date" />
              <Stat label="Children's forms" value={whole(h.childrensForms)} note="Photo consent, volunteer and pre-registration" />
            </div>

            <h2 style={sectionHeading}>Over time</h2>
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
              <div style={card}>
                <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Given</h3>
                <BarChart title="Money given" labels={a.buckets.map((b) => b.label)} values={a.series.givingPounds} format={money} color="var(--theme-warning-500)" />
              </div>
              <div style={card}>
                <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>People reaching out</h3>
                <BarChart title="Form submissions and prayer requests" labels={a.buckets.map((b) => b.label)} values={a.series.reachedOut} format={whole} color="var(--theme-success-500)" />
              </div>
              <div style={card}>
                <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Event sign-ups</h3>
                <BarChart title="Event sign-ups" labels={a.buckets.map((b) => b.label)} values={a.series.signups} format={whole} color="var(--theme-elevation-700)" />
              </div>
            </div>

            <h2 style={sectionHeading}>Giving</h2>
            <DataTable id="giving-by-fund" table={a.tables['giving-by-fund']} range={range} />
            <DataTable id="giving-by-branch" table={a.tables['giving-by-branch']} range={range} />
            <DataTable id="giving-by-frequency" table={a.tables['giving-by-frequency']} range={range} />

            <h2 style={sectionHeading}>People and forms</h2>
            <DataTable id="submissions-by-type" table={a.tables['submissions-by-type']} range={range} />
            <DataTable id="first-timers-by-church" table={a.tables['first-timers-by-church']} range={range} />
            <DataTable id="how-visitors-heard" table={a.tables['how-visitors-heard']} range={range} />
            <DataTable id="prayer-requests" table={a.tables['prayer-requests']} range={range} />

            <h2 style={sectionHeading}>Events, ministries and homegroups</h2>
            <DataTable id="events" table={a.tables.events} range={range} />
            <DataTable id="ministry-signups" table={a.tables['ministry-signups']} range={range} />
            <DataTable id="homegroup-requests" table={a.tables['homegroup-requests']} range={range} />

            <h2 style={sectionHeading}>Everything by period</h2>
            <DataTable id="by-period" table={a.tables['by-period']} range={range} />

            <h2 style={sectionHeading}>Website visitors</h2>
            <div style={{ ...card, marginBottom: 24 }}>
              <p style={{ margin: 0, fontSize: 14 }}>
                Page views, where visitors come from and which pages they read are in Google Analytics, not here.{' '}
                {gaOn ? (
                  <>
                    Tracking is switched on for this site (it only counts people who accept cookies).{' '}
                    <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
                      Open Google Analytics
                    </a>
                    .
                  </>
                ) : (
                  'Tracking is not switched on yet: add the Google Analytics measurement ID in Vercel.'
                )}
              </p>
            </div>
            <p style={{ margin: '0 0 40px', fontSize: 14 }}>
              The full lists behind these numbers, such as every form submission or donation, can be downloaded as spreadsheets
              from <Link href="/admin">Download data on the dashboard</Link>.
            </p>
          </>
        )}
      </Gutter>
    </DefaultTemplate>
  )
}
