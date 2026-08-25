import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60
export const metadata = { title: 'Programmes' }

const TYPE_LABELS: Record<string, string> = {
  programme: 'All Programmes',
  conference: 'Conferences & Events',
  mission: 'Missions',
  regular: 'Regular',
}

type Args = { searchParams: Promise<{ type?: string }> }

export default async function ProgrammesPage({ searchParams }: Args) {
  const { type } = await searchParams
  const payload = await getPayloadClient()
  const events = await payload.find({
    collection: 'events',
    where: type ? { type: { equals: type } } : {},
    sort: '-startDate',
    limit: 50,
    draft: false,
  })

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
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.label}
              href={f.value ? `/programmes?type=${f.value}` : '/programmes'}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                type === f.value
                  ? 'bg-brand-600 text-white'
                  : 'border border-border text-ink hover:bg-brand-50'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {events.docs.length > 0 ? (
          <ul className="space-y-4">
            {events.docs.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/programmes/${event.slug}`}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                      {TYPE_LABELS[event.type] ?? event.type}
                    </p>
                    <p className="mt-1 font-semibold text-brand-700">{event.title}</p>
                    {event.location && <p className="text-sm text-ink-muted">{event.location}</p>}
                  </div>
                  <span className="shrink-0 text-sm font-medium text-ink-muted">
                    {new Date(event.startDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted">No programmes found.</p>
        )}
      </Container>
    </div>
  )
}
