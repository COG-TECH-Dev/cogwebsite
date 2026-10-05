import Image from 'next/image'
import Link from 'next/link'
import type { Where } from 'payload'

import { getPayloadClient } from '@/lib/payload'
import { formatEventDateRange, TYPE_ICONS, TYPE_LABELS } from '@/lib/eventDisplay'
import { MONTH_PARAM, monthLabel, monthOverlapWhere, monthsCovered } from '@/lib/eventMonths'
import { pastEventsWhere, upcomingEventsWhere } from '@/lib/eventWindow'
import { publishedOnly } from '@/lib/published'
import { richTextToPlain } from '@/lib/richTextPlain'
import { BlockIcon } from '@/components/blocks/BlockIcon'
import { ACCENTS, BrandPanel } from '@/components/ui/BrandVisuals'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60
export const metadata = { title: 'Programmes' }

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

type Args = { searchParams: Promise<{ type?: string; ministry?: string; month?: string }> }

// Keeps the other filters when one changes.
function listHref(params: { type?: string; ministry?: string; month?: string }) {
  const qs = new URLSearchParams()
  if (params.type) qs.set('type', params.type)
  if (params.ministry) qs.set('ministry', params.ministry)
  if (params.month) qs.set('month', params.month)
  const s = qs.toString()
  return s ? `/programmes?${s}` : '/programmes'
}

export default async function ProgrammesPage({ searchParams }: Args) {
  const sp = await searchParams
  const type = sp.type || undefined
  const ministryId = sp.ministry && /^\d+$/.test(sp.ministry) ? Number(sp.ministry) : undefined
  const month = sp.month && MONTH_PARAM.test(sp.month) ? sp.month : undefined
  const payload = await getPayloadClient()

  const filterConditions: Where[] = []
  if (type) filterConditions.push({ type: { equals: type } })
  if (ministryId) filterConditions.push({ relatedMinistry: { equals: ministryId } })
  if (month) filterConditions.push(monthOverlapWhere(month))

  const [upcoming, past, everything] = await Promise.all([
    payload.find({
      collection: 'events',
      where: { and: [...filterConditions, upcomingEventsWhere(), publishedOnly] },
      sort: 'startDate',
      limit: 50,
      draft: false,
    }),
    payload.find({
      collection: 'events',
      where: { and: [...filterConditions, pastEventsWhere(), publishedOnly] },
      sort: '-startDate',
      limit: 12,
      draft: false,
    }),
    // Every published event, only to work out which ministries and months are worth offering as filters.
    payload.find({ collection: 'events', where: publishedOnly, limit: 500, depth: 1, draft: false }),
  ])

  const ministries = new Map<number, string>()
  const months = new Set<string>()
  for (const e of everything.docs) {
    if (e.relatedMinistry && typeof e.relatedMinistry === 'object') ministries.set(e.relatedMinistry.id, e.relatedMinistry.name)
    for (const m of monthsCovered(e.startDate, e.endDate)) months.add(m)
  }
  const ministryOptions = [...ministries.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  const monthOptions = [...months].sort()

  const filters = [
    { label: 'All', value: undefined as string | undefined },
    { label: 'Programmes', value: 'programme' },
    { label: 'Conferences & Events', value: 'conference' },
    { label: 'Missions', value: 'mission' },
    { label: 'Regular', value: 'regular' },
  ]
  const hasExtraFilters = Boolean(ministryId || month)
  const anyFilter = Boolean(type || hasExtraFilters)
  const keep = { ministry: ministryId ? String(ministryId) : undefined, month }

  return (
    <div>
      <PageHeader
        eyebrow="What's On"
        title="Programmes & Events"
        description="Missions, conferences, and regular gatherings throughout the year."
      />
      <Container className="py-16">
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.label}
              href={listHref({ type: f.value, ...keep })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                type === f.value
                  ? 'bg-gold-500 text-brand-700'
                  : 'border border-border text-ink hover:bg-brand-50'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {(ministryOptions.length > 0 || monthOptions.length > 0) && (
          <form
            action="/programmes"
            className="mb-10 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-surface p-5"
          >
            {type && <input type="hidden" name="type" value={type} />}
            {monthOptions.length > 0 && (
              <div className="min-w-[160px]">
                <label htmlFor="month" className="mb-1 block text-sm font-medium text-ink">
                  Month
                </label>
                <select id="month" name="month" defaultValue={month ?? ''} className="input">
                  <option value="">All dates</option>
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>
                      {monthLabel(m)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {ministryOptions.length > 0 && (
              <div className="min-w-[180px]">
                <label htmlFor="ministry" className="mb-1 block text-sm font-medium text-ink">
                  Ministry
                </label>
                <select id="ministry" name="ministry" defaultValue={ministryId ? String(ministryId) : ''} className="input">
                  <option value="">All ministries</option>
                  {ministryOptions.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Filter
              </button>
              {anyFilter && (
                <Link
                  href="/programmes"
                  className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-brand-50"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        )}

        {upcoming.docs.length > 0 ? (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.docs.map((event, i) => {
              const img = mediaUrl(event.featuredImage)
              const accent = ACCENTS[i % ACCENTS.length]
              const icon = TYPE_ICONS[event.type] ?? 'compass'
              const summary = richTextToPlain(event.description, 120)
              const ministryName =
                event.relatedMinistry && typeof event.relatedMinistry === 'object' ? event.relatedMinistry.name : null
              return (
                <StaggerItem key={event.id} className="h-full">
                  <Link
                    // With RSVP on, go straight to the sign-up on the event page.
                    href={`/programmes/${event.slug}${event.registrationEnabled ? '#rsvp' : ''}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      {img ? (
                        <Image
                          src={img}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <BrandPanel className="absolute inset-0 flex items-center justify-center">
                          <BlockIcon name={icon} className="h-10 w-10 text-gold-300" />
                        </BrandPanel>
                      )}
                      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${accent.bar}`} />
                      <span className="absolute bottom-3 left-3 rounded-full bg-brand-700/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        {formatEventDateRange(event.startDate, event.endDate)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                        {TYPE_LABELS[event.type] ?? event.type}
                      </p>
                      <h2 className="mt-1 font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                        {event.title}
                      </h2>
                      {event.timeLabel && <p className="mt-1 text-sm font-medium text-ink">{event.timeLabel}</p>}
                      {event.location && <p className="mt-0.5 text-sm text-ink-muted">{event.location}</p>}
                      {summary && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">{summary}</p>}
                      {ministryName && <p className="mt-2 text-xs text-ink-muted">Hosted by {ministryName}</p>}
                      {event.registrationEnabled && (
                        <span className="mt-3 inline-flex w-fit items-center rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-700">
                          RSVP now <span aria-hidden="true">&nbsp;→</span>
                        </span>
                      )}
                    </div>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        ) : (
          <p className="text-ink-muted">
            {anyFilter
              ? 'No upcoming programmes match these filters. Try clearing one.'
              : 'No upcoming programmes right now — check back soon.'}
          </p>
        )}

        {past.docs.length > 0 && (
          <Reveal className="mt-16 border-t border-border pt-10">
            <h2 className="mb-6 font-serif text-xl font-semibold text-brand-700">Past Events</h2>
            <ul className="space-y-3">
              {past.docs.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/programmes/${event.slug}`}
                    className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-gold-300 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        {TYPE_LABELS[event.type] ?? event.type}
                      </span>
                      <p className="font-medium text-ink">{event.title}</p>
                    </div>
                    <span className="shrink-0 text-sm text-ink-muted">
                      {formatEventDateRange(event.startDate, event.endDate)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </Container>
    </div>
  )
}
