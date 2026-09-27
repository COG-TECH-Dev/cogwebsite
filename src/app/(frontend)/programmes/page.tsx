import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { formatEventDateRange, TYPE_ICONS, TYPE_LABELS } from '@/lib/eventDisplay'
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

type Args = { searchParams: Promise<{ type?: string }> }

export default async function ProgrammesPage({ searchParams }: Args) {
  const { type } = await searchParams
  const payload = await getPayloadClient()
  const now = new Date().toISOString()

  const typeConditions = type ? [{ type: { equals: type } }] : []

  const [upcoming, past] = await Promise.all([
    payload.find({
      collection: 'events',
      where: { and: [...typeConditions, { startDate: { greater_than_equal: now } }] },
      sort: 'startDate',
      limit: 50,
      draft: false,
    }),
    payload.find({
      collection: 'events',
      where: { and: [...typeConditions, { startDate: { less_than: now } }] },
      sort: '-startDate',
      limit: 12,
      draft: false,
    }),
  ])

  const filters = [
    { label: 'All', value: undefined },
    { label: 'Programmes', value: 'programme' },
    { label: 'Conferences & Events', value: 'conference' },
    { label: 'Missions', value: 'mission' },
    { label: 'Regular', value: 'regular' },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="What's On"
        title="Programmes & Events"
        description="Missions, conferences, and regular gatherings throughout the year."
      />
      <Container className="py-16">
        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.label}
              href={f.value ? `/programmes?type=${f.value}` : '/programmes'}
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

        {upcoming.docs.length > 0 ? (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.docs.map((event, i) => {
              const img = mediaUrl(event.featuredImage)
              const accent = ACCENTS[i % ACCENTS.length]
              const icon = TYPE_ICONS[event.type] ?? 'compass'
              return (
                <StaggerItem key={event.id} className="h-full">
                  <Link
                    href={`/programmes/${event.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      {img ? (
                        <Image
                          src={img}
                          alt={event.title}
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
                      <p className="mt-1 font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                        {event.title}
                      </p>
                      {event.location && <p className="mt-1 text-sm text-ink-muted">{event.location}</p>}
                    </div>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        ) : (
          <p className="text-ink-muted">No upcoming programmes right now — check back soon.</p>
        )}

        {past.docs.length > 0 && (
          <Reveal className="mt-16 border-t border-border pt-10">
            <h2 className="mb-6 font-serif text-xl font-semibold text-brand-700">Past Events</h2>
            <ul className="space-y-3">
              {past.docs.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/programmes/${event.slug}`}
                    className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 opacity-80 transition-opacity hover:opacity-100 sm:flex-row sm:items-center sm:justify-between"
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
