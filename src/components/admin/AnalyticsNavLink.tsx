import Link from 'next/link'

/** A link to the Analytics page at the bottom of the admin menu, for Admin / Super Admin only. */
export function AnalyticsNavLink({ user }: { user?: { role?: string | null } | null }) {
  if (user?.role !== 'admin' && user?.role !== 'super-admin') return null
  return (
    <Link href="/admin/analytics" className="nav__link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="nav__link-label">Analytics</span>
    </Link>
  )
}
