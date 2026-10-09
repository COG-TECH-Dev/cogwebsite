import type { Setting } from '@/payload-types'

// City of God Gateshead has no website of its own, so its page (and its card on Find a Church) is built here. These are the
// details the church supplied; anything entered under Settings > Gateshead church page replaces them.
const DEFAULT_ADDRESS = ['Dunston Community Centre', 'Railway Street', 'Dunston', 'Gateshead', 'NE11 9EB']
const DEFAULT_TIMES = [
  { label: 'Sundays', time: '10:00am' },
  { label: 'Thursdays', time: '7:00pm' },
]

export function gatesheadDetails(settings: Setting | null | undefined) {
  const g = settings?.gatesheadChurch
  const times = (g?.serviceTimes ?? []).filter((t) => t.label && t.time)
  const lines = (g?.address ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
  return {
    about: g?.about?.trim() || null,
    times: times.length > 0 ? times.map((t) => ({ label: t.label, time: t.time })) : DEFAULT_TIMES,
    addressLines: lines.length > 0 ? lines : DEFAULT_ADDRESS,
    email: g?.contactEmail?.trim() || null,
    phone: g?.contactPhone?.trim() || null,
  }
}
