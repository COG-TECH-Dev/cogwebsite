import { DATA_EXPORTS } from '../../lib/dataExports'

const field = {
  display: 'block',
  width: '100%',
  padding: '8px 10px',
  marginTop: 4,
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-s, 4px)',
  background: 'var(--theme-input-bg, var(--theme-bg))',
  color: 'var(--theme-text)',
  font: 'inherit',
} as const

/**
 * "Download data" panel at the top of the admin dashboard. A plain GET form —
 * no client JavaScript — that sends the browser to /api/data-export, which
 * checks the admin session and replies with a CSV file. Only shown to Admin /
 * Super Admin, since the download itself refuses everyone else.
 */
export function ExportPanel({ user }: { user?: { role?: string | null } | null }) {
  if (user?.role !== 'admin' && user?.role !== 'super-admin') return null

  return (
    <section
      style={{
        marginBottom: 32,
        padding: 20,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m, 8px)',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <h2 style={{ margin: 0, fontSize: 18 }}>Download data</h2>
      <p style={{ margin: '4px 0 16px', opacity: 0.75, fontSize: 14 }}>
        Export what people have submitted through the website as a spreadsheet (CSV). Leave the dates empty to get
        everything.
      </p>
      <form method="get" action="/api/data-export" style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <label style={{ fontSize: 14 }}>
          What to download
          <select name="type" required defaultValue="form-submissions" style={field}>
            {Object.entries(DATA_EXPORTS).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <label style={{ fontSize: 14 }}>
            From (optional)
            <input type="date" name="from" style={field} />
          </label>
          <label style={{ fontSize: 14 }}>
            To (optional)
            <input type="date" name="to" style={field} />
          </label>
        </div>
        <div>
          <button
            type="submit"
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: 'var(--style-radius-s, 4px)',
              background: 'var(--theme-text)',
              color: 'var(--theme-bg)',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            Download CSV
          </button>
        </div>
      </form>
    </section>
  )
}
