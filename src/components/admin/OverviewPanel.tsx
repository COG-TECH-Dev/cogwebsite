import Link from 'next/link'
import type { Payload } from 'payload'

import { getAnalytics } from '../../lib/analytics'
import { getTraffic } from '../../lib/googleAnalytics'

const money = (n: number) => n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: n % 1 === 0 ? 0 : 2 })
const whole = (n: number) => n.toLocaleString('en-GB')

const tile = {
  padding: '12px 14px',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-s, 4px)',
  background: 'var(--theme-bg)',
} as const

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={tile}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.25, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {note && <div style={{ fontSize: 11, opacity: 0.65 }}>{note}</div>}
    </div>
  )
}

/**
 * "How the website is doing" at the top of the admin dashboard, for Admin / Super Admin only: the last 30 days at
 * a glance (visitors from Google Analytics when it is connected, plus what people did through the site), with a link
 * to the full Analytics page.
 */
export async function OverviewPanel({ payload, user }: { payload?: Payload; user?: { role?: string | null } | null }) {
  if (!payload || (user?.role !== 'admin' && user?.role !== 'super-admin')) return null

  const a = await getAnalytics(payload, '30d').catch(() => null)
  if (!a) return null
  const traffic = await getTraffic(a)
  const h = a.headline

  return (
    <section
      aria-labelledby="overview-heading"
      style={{
        marginBottom: 32,
        padding: 20,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m, 8px)',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <h2 id="overview-heading" style={{ margin: 0, fontSize: 18 }}>
          How the website is doing: last 30 days
        </h2>
        <Link href="/admin/analytics" style={{ fontSize: 14 }}>
          See all analytics →
        </Link>
      </div>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginTop: 12 }}>
        {traffic.ok ? (
          <>
            <Tile label="Visitors" value={whole(traffic.headline.visitors)} note="From Google Analytics" />
            <Tile label="Page views" value={whole(traffic.headline.pageViews)} />
          </>
        ) : null}
        <Tile label="People reaching out" value={whole(h.reachedOut)} note="Forms and prayer requests" />
        <Tile label="First-time visitors" value={whole(h.firstTimers)} />
        <Tile label="Event sign-ups" value={whole(h.signupAttendees)} note={`${whole(h.signupVolunteers)} volunteer${h.signupVolunteers === 1 ? '' : 's'}`} />
        <Tile label="Given" value={money(h.givingPounds)} note={`${whole(h.gifts)} gift${h.gifts === 1 ? '' : 's'}`} />
      </div>
      {!traffic.ok && (
        <p style={{ margin: '12px 0 0', fontSize: 13, opacity: 0.8 }}>
          {traffic.reason === 'error' ? `Visitor numbers could not be read: ${traffic.message} ${traffic.hint ?? ''}` : 'Website visitor numbers appear here once Google Analytics is connected.'}{' '}
          <Link href="/admin/analytics">How to connect it</Link>
        </p>
      )}
    </section>
  )
}
