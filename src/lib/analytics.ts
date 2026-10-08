import type { Payload } from 'payload'

import { dayKey } from './eventCalendar'

// The numbers behind the admin "Analytics" page and its CSV downloads. Counts and totals only: no names,
// messages or contact details. Website traffic is not here, because it lives in Google Analytics.

export const RANGES = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'ytd', label: 'This year' },
  { value: 'all', label: 'All time' },
] as const

export type RangeKey = (typeof RANGES)[number]['value']
export const isRange = (v: unknown): v is RangeKey => RANGES.some((r) => r.value === v)

type Granularity = 'day' | 'week' | 'month'
type Cell = string | number
export type TableFormat = 'text' | 'int' | 'money' | 'percent'

export type Table = {
  title: string
  note?: string
  headers: string[]
  /** How each column is shown. CSV downloads always carry the plain numbers (money in pounds). */
  formats: TableFormat[]
  rows: Cell[][]
}

export type Analytics = {
  range: RangeKey
  rangeLabel: string
  fromKey: string
  toKey: string
  granularity: Granularity
  buckets: { key: string; label: string }[]
  series: { reachedOut: number[]; signups: number[]; givingPounds: number[] }
  headline: {
    reachedOut: number
    firstTimers: number
    prayerRequests: number
    childrensForms: number
    signupAttendees: number
    signupVolunteers: number
    gifts: number
    givingPounds: number
    averageGiftPounds: number
    recurringPounds: number
    recurringGivers: number
    giftAidPounds: number
    giftAidShare: number
    checkoutsStarted: number
    checkoutsCompleted: number
    scheduledGifts: number
  }
  tables: Record<string, Table>
}

const FORM_LABELS: Record<string, string> = {
  contact: 'Contact',
  appointment: 'Appointment request',
  membership: 'Ministry sign-up',
  'reference-letter': 'Reference letter request',
  welfare: 'Welfare and support request',
  'step-of-faith': 'Step of faith',
  'homegroup-join': 'Join a homegroup',
  'first-timer': 'First-time visitor',
  'mission-trip': 'Mission trip / volunteer sign-up',
  'campus-connect': 'Campus connection',
  'ministry-message': 'Message to a ministry team',
}

// ---------------------------------------------------------------- dates (all in UK time)

const addDays = (key: string, days: number) => {
  const d = new Date(`${key}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const monthStart = (key: string, monthsBack: number) => {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 - monthsBack, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`
}

const mondayOf = (key: string) => {
  const weekday = (new Date(`${key}T12:00:00Z`).getUTCDay() + 6) % 7
  return addDays(key, -weekday)
}

const shortDay = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const shortMonth = (key: string) =>
  new Date(`${key}-01T12:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: '2-digit', timeZone: 'UTC' })

function bucketOf(day: string, g: Granularity): string {
  return g === 'day' ? day : g === 'week' ? mondayOf(day) : day.slice(0, 7)
}

function makeBuckets(fromKey: string, toKey: string, g: Granularity) {
  const out: { key: string; label: string }[] = []
  if (g === 'month') {
    let key = fromKey.slice(0, 7)
    const last = toKey.slice(0, 7)
    while (key <= last && out.length < 60) {
      out.push({ key, label: shortMonth(key) })
      const [y, m] = key.split('-').map(Number)
      const next = new Date(Date.UTC(y, m, 1))
      key = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`
    }
    return out
  }
  let key = g === 'week' ? mondayOf(fromKey) : fromKey
  while (key <= toKey && out.length < 400) {
    out.push({ key, label: g === 'week' ? `w/c ${shortDay(key)}` : shortDay(key) })
    key = addDays(key, g === 'week' ? 7 : 1)
  }
  return out
}

// ---------------------------------------------------------------- small helpers

type Row = Record<string, unknown>

const relId = (value: unknown): number | null => {
  if (value && typeof value === 'object') return Number((value as Row).id) || null
  return typeof value === 'number' ? value : null
}

const count = <T>(items: T[], keyOf: (item: T) => string | null | undefined) => {
  const out = new Map<string, number>()
  for (const item of items) {
    const key = keyOf(item)
    if (key) out.set(key, (out.get(key) ?? 0) + 1)
  }
  return out
}

const share = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0)
const pounds = (pence: number) => Math.round(pence) / 100
const sortedDesc = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

export function formatCell(value: Cell, format: TableFormat): string {
  if (typeof value === 'string') return value
  if (format === 'money') return value.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })
  if (format === 'percent') return `${value}%`
  return value.toLocaleString('en-GB')
}

// ---------------------------------------------------------------- the numbers

export async function getAnalytics(payload: Payload, range: RangeKey, now: Date = new Date()): Promise<Analytics> {
  const toKey = dayKey(now)
  const rangeLabel = RANGES.find((r) => r.value === range)?.label ?? range
  let fromKey: string | null
  let g: Granularity
  if (range === '30d') {
    fromKey = addDays(toKey, -29)
    g = 'day'
  } else if (range === '90d') {
    fromKey = addDays(toKey, -89)
    g = 'week'
  } else if (range === '12m') {
    fromKey = monthStart(toKey, 11)
    g = 'month'
  } else if (range === 'ytd') {
    fromKey = `${toKey.slice(0, 4)}-01-01`
    g = 'month'
  } else {
    fromKey = null
    g = 'month'
  }
  // Fetch a day early (UTC dates against UK days), then keep only what falls in range below.
  const fromIso = fromKey ? `${addDays(fromKey, -1)}T00:00:00.000Z` : null
  const since = (field: string) => (fromIso ? { [field]: { greater_than_equal: fromIso } } : undefined)

  const [subsRes, prayersRes, kidsRes, regsRes, eventsRes, donationsRes, ministriesRes, homegroupsRes] = await Promise.all([
    payload.find({
      collection: 'form-submissions',
      where: since('createdAt'),
      pagination: false,
      depth: 0,
      select: { formType: true, createdAt: true, campus: true, howHeard: true, interestedMinistry: true, interestedHomegroup: true },
    }),
    payload.find({ collection: 'prayer-requests', where: since('createdAt'), pagination: false, depth: 0, select: { createdAt: true, visibility: true } }),
    payload.find({ collection: 'child-safeguarding-forms', where: since('createdAt'), pagination: false, depth: 0, select: { createdAt: true, formType: true } }),
    payload.find({ collection: 'event-registrations', pagination: false, depth: 0, select: { createdAt: true, event: true, role: true, guests: true } }),
    payload.find({
      collection: 'events',
      pagination: false,
      depth: 0,
      sort: '-startDate',
      select: { title: true, startDate: true, endDate: true, type: true, capacity: true, registrationEnabled: true, _status: true },
    }),
    payload.find({
      collection: 'donations',
      where: fromIso ? { or: [{ createdAt: { greater_than_equal: fromIso } }, { paidAt: { greater_than_equal: fromIso } }] } : undefined,
      pagination: false,
      depth: 0,
      select: { amount: true, status: true, paidAt: true, createdAt: true, fund: true, branch: true, frequency: true, giftAid: true, stripeSubscriptionId: true },
    }),
    payload.find({ collection: 'ministries', pagination: false, depth: 0, select: { name: true } }),
    payload.find({ collection: 'homegroups', pagination: false, depth: 0, select: { area: true } }),
  ])

  const inRange = (iso: unknown) => {
    if (typeof iso !== 'string') return false
    const d = dayKey(iso)
    return d <= toKey && (!fromKey || d >= fromKey)
  }

  const subs = (subsRes.docs as unknown as Row[]).filter((d) => inRange(d.createdAt))
  const prayers = (prayersRes.docs as unknown as Row[]).filter((d) => inRange(d.createdAt))
  const kids = (kidsRes.docs as unknown as Row[]).filter((d) => inRange(d.createdAt))
  const allRegs = regsRes.docs as unknown as Row[]
  const regs = allRegs.filter((d) => inRange(d.createdAt))
  const events = eventsRes.docs as unknown as Row[]
  const donationsAll = donationsRes.docs as unknown as Row[]
  const effective = (d: Row) => (typeof d.paidAt === 'string' ? d.paidAt : (d.createdAt as string))
  const completed = donationsAll.filter((d) => d.status === 'completed' && inRange(effective(d)))
  const started = donationsAll.filter((d) => inRange(d.createdAt))

  // ---- the period the charts run over
  if (!fromKey) {
    const all = [
      ...subs.map((d) => dayKey(d.createdAt as string)),
      ...completed.map((d) => dayKey(effective(d))),
      ...regs.map((d) => dayKey(d.createdAt as string)),
    ].sort()
    const earliest = all[0] ?? toKey
    fromKey = earliest < monthStart(toKey, 23) ? monthStart(toKey, 23) : earliest
  }
  const buckets = makeBuckets(fromKey, toKey, g)
  const index = new Map(buckets.map((b, i) => [b.key, i]))
  const place = (iso: string) => index.get(bucketOf(dayKey(iso), g))
  const series = { reachedOut: buckets.map(() => 0), signups: buckets.map(() => 0), givingPounds: buckets.map(() => 0) }
  for (const d of [...subs, ...prayers]) {
    const i = place(d.createdAt as string)
    if (i !== undefined) series.reachedOut[i] += 1
  }
  for (const d of regs) {
    const i = place(d.createdAt as string)
    if (i !== undefined) series.signups[i] += 1
  }
  for (const d of completed) {
    const i = place(effective(d))
    if (i !== undefined) series.givingPounds[i] += pounds(Number(d.amount) || 0)
  }
  series.givingPounds = series.givingPounds.map((v) => Math.round(v * 100) / 100)

  // ---- giving
  const sumPence = (list: Row[]) => list.reduce((t, d) => t + (Number(d.amount) || 0), 0)
  const totalPence = sumPence(completed)
  const recurring = completed.filter((d) => d.frequency === 'weekly' || d.frequency === 'monthly')
  const giftAid = completed.filter((d) => (d.giftAid as Row | undefined)?.declared)
  const givingTable = (title: string, keyOf: (d: Row) => string | null, note?: string): Table => {
    const m = new Map<string, { n: number; pence: number }>()
    for (const d of completed) {
      const key = keyOf(d) || 'Not recorded'
      const t = m.get(key) ?? { n: 0, pence: 0 }
      t.n += 1
      t.pence += Number(d.amount) || 0
      m.set(key, t)
    }
    return {
      title,
      note,
      headers: [title.replace(/^Giving by /, '').replace(/^./, (c) => c.toUpperCase()), 'Gifts', 'Total', 'Share of giving'],
      formats: ['text', 'int', 'money', 'percent'],
      rows: [...m.entries()].sort((a, b) => b[1].pence - a[1].pence).map(([k, t]) => [k, t.n, pounds(t.pence), share(t.pence, totalPence)]),
    }
  }

  // ---- form submissions
  const byType = count(subs, (d) => String(d.formType))
  const firstTimers = subs.filter((d) => d.formType === 'first-timer')
  const ministryNames = new Map((ministriesRes.docs as unknown as Row[]).map((m) => [Number(m.id), String(m.name)]))
  const groupNames = new Map((homegroupsRes.docs as unknown as Row[]).map((h) => [Number(h.id), String(h.area)]))
  const byIdName = (list: Row[], key: string, names: Map<number, string>) =>
    count(list, (d) => {
      const id = relId(d[key])
      return id ? (names.get(id) ?? `#${id}`) : null
    })

  // ---- event sign-ups
  const perEvent = new Map<number, { registrations: number; attendees: number; volunteers: number }>()
  for (const r of allRegs) {
    const id = relId(r.event)
    if (!id) continue
    const t = perEvent.get(id) ?? { registrations: 0, attendees: 0, volunteers: 0 }
    t.registrations += 1
    if (r.role === 'volunteer') t.volunteers += 1
    else t.attendees += typeof r.guests === 'number' ? r.guests : 1
    perEvent.set(id, t)
  }
  const attendeesInRange = regs.filter((r) => r.role !== 'volunteer').reduce((t, r) => t + (typeof r.guests === 'number' ? r.guests : 1), 0)
  const volunteersInRange = regs.filter((r) => r.role === 'volunteer').length

  const tables: Record<string, Table> = {
    'by-period': {
      title: `Activity by ${g}`,
      headers: [g === 'day' ? 'Day' : g === 'week' ? 'Week starting' : 'Month', 'Form submissions and prayer requests', 'Event sign-ups', 'Giving'],
      formats: ['text', 'int', 'int', 'money'],
      rows: buckets.map((b, i) => [b.key, series.reachedOut[i], series.signups[i], series.givingPounds[i]]),
    },
    'submissions-by-type': {
      title: 'Form submissions by type',
      headers: ['Form', 'Submissions', 'Share'],
      formats: ['text', 'int', 'percent'],
      rows: sortedDesc(byType).map(([k, n]) => [FORM_LABELS[k] ?? k, n, share(n, subs.length)]),
    },
    'giving-by-fund': givingTable('Giving by fund', (d) => (d.fund as string) ?? null),
    'giving-by-branch': givingTable('Giving by branch', (d) => (d.branch as string) ?? null),
    'giving-by-frequency': givingTable('Giving by frequency', (d) => ({ 'one-time': 'One-time', weekly: 'Weekly', monthly: 'Monthly' })[String(d.frequency)] ?? null),
    events: {
      title: 'Events and sign-ups',
      note: 'Events starting in this period or later. Sign-ups are all-time for each event.',
      headers: ['Event', 'Type', 'Starts', 'Published', 'Capacity', 'Sign-ups', 'People attending', 'Volunteers', 'Places filled'],
      formats: ['text', 'text', 'text', 'text', 'int', 'int', 'int', 'int', 'percent'],
      rows: events
        .filter((e) => dayKey(e.startDate as string) >= (fromKey as string))
        .map((e) => {
          const t = perEvent.get(Number(e.id)) ?? { registrations: 0, attendees: 0, volunteers: 0 }
          const cap = typeof e.capacity === 'number' && e.capacity > 0 ? e.capacity : 0
          return [String(e.title), String(e.type), dayKey(e.startDate as string), e._status === 'published' ? 'Yes' : 'No', cap, t.registrations, t.attendees, t.volunteers, cap ? Math.round((t.attendees / cap) * 100) : 0]
        }),
    },
    'ministry-signups': {
      title: 'Ministry sign-ups and messages',
      headers: ['Ministry', 'Sign-up requests', 'Messages to the team'],
      formats: ['text', 'int', 'int'],
      rows: (() => {
        const signups = byIdName(subs.filter((d) => d.formType === 'membership'), 'interestedMinistry', ministryNames)
        const messages = byIdName(subs.filter((d) => d.formType === 'ministry-message'), 'interestedMinistry', ministryNames)
        return [...new Set([...signups.keys(), ...messages.keys()])]
          .map((k): Cell[] => [k, signups.get(k) ?? 0, messages.get(k) ?? 0])
          .sort((a, b) => (b[1] as number) + (b[2] as number) - ((a[1] as number) + (a[2] as number)))
      })(),
    },
    'homegroup-requests': {
      title: 'Homegroup requests',
      headers: ['Homegroup', 'Requests to join', 'First-time visitors who named it'],
      formats: ['text', 'int', 'int'],
      rows: (() => {
        const joins = byIdName(subs.filter((d) => d.formType === 'homegroup-join'), 'interestedHomegroup', groupNames)
        const named = byIdName(firstTimers, 'interestedHomegroup', groupNames)
        const unsure = subs.filter((d) => d.formType === 'homegroup-join' && !relId(d.interestedHomegroup)).length
        const rows = [...new Set([...joins.keys(), ...named.keys()])]
          .map((k): Cell[] => [k, joins.get(k) ?? 0, named.get(k) ?? 0])
          .sort((a, b) => (b[1] as number) + (b[2] as number) - ((a[1] as number) + (a[2] as number)))
        if (unsure) rows.push(['Not sure yet (wants help finding one)', unsure, 0])
        return rows
      })(),
    },
    'first-timers-by-church': {
      title: 'First-time visitors by church',
      headers: ['Church', 'Visitors', 'Share'],
      formats: ['text', 'int', 'percent'],
      rows: sortedDesc(count(firstTimers, (d) => (d.campus as string) || 'Not given')).map(([k, n]) => [k, n, share(n, firstTimers.length)]),
    },
    'how-visitors-heard': {
      title: 'How first-time visitors heard about us',
      note: 'As typed by visitors, grouped ignoring capital letters. Blank answers are left out.',
      headers: ['Answer', 'Visitors'],
      formats: ['text', 'int'],
      rows: sortedDesc(count(firstTimers, (d) => (typeof d.howHeard === 'string' ? d.howHeard.trim().toLowerCase().replace(/\s+/g, ' ') || null : null)))
        .slice(0, 15)
        .map(([k, n]): Cell[] => [k, n]),
    },
    'prayer-requests': {
      title: 'Prayer requests by who may see them',
      headers: ['Who may see it', 'Requests'],
      formats: ['text', 'int'],
      rows: sortedDesc(count(prayers, (d) => ({ private: 'Private', 'ministry-team': 'Ministry team', public: 'Public prayer wall' })[String(d.visibility ?? 'private')] ?? 'Private')).map(([k, n]): Cell[] => [k, n]),
    },
  }

  return {
    range,
    rangeLabel,
    fromKey,
    toKey,
    granularity: g,
    buckets,
    series,
    headline: {
      reachedOut: subs.length + prayers.length,
      firstTimers: firstTimers.length,
      prayerRequests: prayers.length,
      childrensForms: kids.length,
      signupAttendees: attendeesInRange,
      signupVolunteers: volunteersInRange,
      gifts: completed.length,
      givingPounds: pounds(totalPence),
      averageGiftPounds: completed.length ? pounds(totalPence / completed.length) : 0,
      recurringPounds: pounds(sumPence(recurring)),
      recurringGivers: new Set(recurring.map((d) => d.stripeSubscriptionId).filter(Boolean)).size,
      giftAidPounds: pounds(sumPence(giftAid)),
      giftAidShare: share(giftAid.length, completed.length),
      checkoutsStarted: started.filter((d) => d.status !== 'scheduled').length,
      checkoutsCompleted: started.filter((d) => d.status === 'completed').length,
      scheduledGifts: donationsAll.filter((d) => d.status === 'scheduled').length,
    },
    tables,
  }
}
