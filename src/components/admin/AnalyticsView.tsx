import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'
import Link from 'next/link'

import { RANGES, formatCell, getAnalytics, isRange, type RangeKey, type Table } from '../../lib/analytics'
import { getTraffic, type Traffic } from '../../lib/googleAnalytics'
import { BarChart } from './BarChart'

const money = (n: number) => n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: n % 1 === 0 ? 0 : 2 })
const whole = (n: number) => n.toLocaleString('en-GB')
const minutes = (s: number) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`

const card = {
  padding: 16,
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-m, 8px)',
  background: 'var(--theme-elevation-50)',
} as const

const sectionHeading = { margin: '32px 0 12px', fontSize: 20 } as const
const statGrid = { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' } as const

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

/** How to connect Google Analytics (or what went wrong), shown instead of the visitor figures. */
function ConnectGoogleAnalytics({ traffic, trackingOn }: { traffic: Extract<Traffic, { ok: false }>; trackingOn: boolean }) {
  const failed = traffic.reason === 'error'
  return (
    <div style={{ ...card, borderColor: failed ? 'var(--theme-error-500)' : 'var(--theme-elevation-150)' }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>{failed ? 'Google Analytics could not be read' : 'See website visitors here'}</h2>
      {failed ? (
        <p style={{ margin: '8px 0 0', fontSize: 14 }}>
          {traffic.message} {traffic.hint}
        </p>
      ) : (
        <p style={{ margin: '8px 0 0', fontSize: 14, maxWidth: 720 }}>
          {trackingOn
            ? 'The website already sends visits to Google Analytics. Connect the reports to this page, and visitors, page views, the most viewed pages and where people come from appear here, with downloads. It takes about 15 minutes, once.'
            : 'The website is not sending visits to Google Analytics yet: add the measurement ID (NEXT_PUBLIC_GA_MEASUREMENT_ID) in Vercel first, then connect the reports as below.'}
        </p>
      )}
      <ol style={{ margin: '12px 0 0', paddingLeft: 20, fontSize: 14, lineHeight: 1.6, maxWidth: 760 }}>
        <li>
          In <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">Google Analytics</a>, open Admin, then Property details, and copy the <strong>Property ID</strong> (a number).
        </li>
        <li>
          In <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>, create a project (or pick one) and, under APIs &amp; Services, Library, switch on the <strong>Google Analytics Data API</strong>.
        </li>
        <li>Under IAM &amp; Admin, Service Accounts, create a service account (any name, no roles needed). Open it, then Keys, Add key, JSON. A key file downloads.</li>
        <li>
          Back in Google Analytics, Admin, Property access management: add the service account&apos;s email address (it looks like
          name@project.iam.gserviceaccount.com) with the role <strong>Viewer</strong>.
        </li>
        <li>
          In Vercel, Settings, Environment Variables, add <code>GA4_PROPERTY_ID</code> (the number) and <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> (paste the whole contents of the key file, and tick
          Sensitive) for Production, then redeploy.
        </li>
      </ol>
      <p style={{ margin: '12px 0 0', fontSize: 13, opacity: 0.75 }}>
        Keep the key file private: do not email it or paste it into a chat. Only the church&apos;s website server uses it, and it can only read reports.
      </p>
    </div>
  )
}

/**
 * The admin "Analytics" page (Admin / Super Admin only): website visitors from Google Analytics, headline numbers
 * for what people have done through the site, charts over time and tables, with a CSV download beside each table.
 */
export async function AnalyticsView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req } = initPageResult
  const user = req.user
  const allowed = user?.role === 'admin' || user?.role === 'super-admin'
  const raw = searchParams?.range
  const range: RangeKey = isRange(raw) ? raw : '90d'
  const a = allowed ? await getAnalytics(req.payload, range) : null
  const traffic = a ? await getTraffic(a) : null
  const h = a?.headline
  const trackingOn = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
  const labels = a?.buckets.map((b) => b.label) ?? []

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
        {!a || !h || !traffic ? (
          <p>Only Admins can see the analytics.</p>
        ) : (
          <>
            <p style={{ margin: '0 0 16px', maxWidth: 720, opacity: 0.8, fontSize: 14 }}>
              How the website is doing: who visits, and what people have done through it (form submissions, event sign-ups and online giving). These are counts
              and totals only. No names, messages or contact details appear on this page.
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

            {/* ---- Website visitors, from Google Analytics ---- */}
            <h2 style={{ ...sectionHeading, marginTop: 0 }}>Website visitors</h2>
            {traffic.ok ? (
              <>
                <div style={statGrid}>
                  <Stat label="Visitors" value={whole(traffic.headline.visitors)} note={`${whole(traffic.headline.newVisitors)} new`} />
                  <Stat label="Visits" value={whole(traffic.headline.sessions)} note="Each time someone comes to the site" />
                  <Stat label="Page views" value={whole(traffic.headline.pageViews)} />
                  <Stat label="Stayed and looked around" value={`${traffic.headline.engagementPercent}%`} note="Visits longer than 10 seconds, or with 2+ pages" />
                  <Stat label="Time on the site" value={minutes(traffic.headline.avgSeconds)} note="Average per visit" />
                </div>
                <div style={{ ...card, marginTop: 12 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Visits over time</h3>
                  <BarChart title="Website visits" labels={labels} values={traffic.sessionsSeries} format={whole} color="var(--theme-success-500)" />
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 12, opacity: 0.7 }}>
                  From Google Analytics, which only counts people who accepted cookies, so real visits are higher. Figures can lag by a few hours and are refreshed every 15
                  minutes.
                </p>
              </>
            ) : (
              <ConnectGoogleAnalytics traffic={traffic} trackingOn={trackingOn} />
            )}

            {/* ---- What people did through the site ---- */}
            <h2 style={sectionHeading}>What people did on the site</h2>
            <div style={statGrid}>
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
                <BarChart title="Money given" labels={labels} values={a.series.givingPounds} format={money} color="var(--theme-warning-500)" />
              </div>
              <div style={card}>
                <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>People reaching out</h3>
                <BarChart title="Form submissions and prayer requests" labels={labels} values={a.series.reachedOut} format={whole} color="var(--theme-success-500)" />
              </div>
              <div style={card}>
                <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Event sign-ups</h3>
                <BarChart title="Event sign-ups" labels={labels} values={a.series.signups} format={whole} color="var(--theme-elevation-700)" />
              </div>
            </div>

            {traffic.ok && (
              <>
                <h2 style={sectionHeading}>Website visitors in detail</h2>
                <DataTable id="top-pages" table={traffic.tables['top-pages']} range={range} />
                <DataTable id="traffic-sources" table={traffic.tables['traffic-sources']} range={range} />
                <DataTable id="visitor-countries" table={traffic.tables['visitor-countries']} range={range} />
                <DataTable id="devices" table={traffic.tables.devices} range={range} />
                <DataTable id="traffic-by-period" table={traffic.tables['traffic-by-period']} range={range} />
              </>
            )}

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

            <p style={{ margin: '24px 0 40px', fontSize: 14 }}>
              The full lists behind these numbers, such as every form submission or donation, can be downloaded as spreadsheets from{' '}
              <Link href="/admin">Download data on the dashboard</Link>.
            </p>
          </>
        )}
      </Gutter>
    </DefaultTemplate>
  )
}
