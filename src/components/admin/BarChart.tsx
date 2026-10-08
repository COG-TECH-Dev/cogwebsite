// A small bar chart drawn as SVG on the server (no chart library, no client JavaScript). Each bar carries its
// own label for hover and screen readers, and the figures are also in a table beneath ("Show the figures").

const W = 480
const H = 190
const PAD = { top: 12, right: 8, bottom: 30, left: 44 }

const niceMax = (v: number) => {
  if (v <= 0) return 1
  const pow = 10 ** Math.floor(Math.log10(v))
  const n = v / pow
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
}

export function BarChart({
  title,
  labels,
  values,
  format,
  color,
}: {
  title: string
  labels: string[]
  values: number[]
  format: (n: number) => string
  color: string
}) {
  const max = niceMax(Math.max(0, ...values))
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const slot = plotW / Math.max(1, values.length)
  const barW = Math.max(2, Math.min(40, slot * 0.7))
  const total = values.reduce((t, v) => t + v, 0)
  const labelEvery = Math.ceil(values.length / 6)
  const ticks = [0, 0.5, 1].map((f) => f * max)

  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${title}. Total ${format(total)} across ${values.length} ${values.length === 1 ? 'period' : 'periods'}. The figures follow in a table.`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {ticks.map((t) => {
          const y = PAD.top + plotH - (t / max) * plotH
          return (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="var(--theme-elevation-150)" strokeWidth={1} />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={11} fill="var(--theme-elevation-600)">
                {format(t)}
              </text>
            </g>
          )
        })}
        {values.map((v, i) => {
          const h = (v / max) * plotH
          const x = PAD.left + i * slot + (slot - barW) / 2
          return (
            <g key={labels[i] + i}>
              <rect x={x} y={PAD.top + plotH - h} width={barW} height={Math.max(v > 0 ? 1 : 0, h)} rx={2} fill={color}>
                <title>{`${labels[i]}: ${format(v)}`}</title>
              </rect>
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={H - 10} textAnchor="middle" fontSize={11} fill="var(--theme-elevation-600)">
                  {labels[i]}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <details style={{ marginTop: 6, fontSize: 13 }}>
        <summary style={{ cursor: 'pointer' }}>Show the figures</summary>
        <table style={{ marginTop: 6, borderCollapse: 'collapse', fontSize: 13 }}>
          <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{title}</caption>
          <tbody>
            {labels.map((l, i) => (
              <tr key={l + i}>
                <th scope="row" style={{ textAlign: 'left', fontWeight: 400, padding: '2px 16px 2px 0' }}>
                  {l}
                </th>
                <td style={{ padding: '2px 0', fontVariantNumeric: 'tabular-nums' }}>{format(values[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
