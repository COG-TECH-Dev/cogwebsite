import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60
export const metadata = { title: 'Sermons' }

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

type Args = { searchParams: Promise<{ q?: string; speaker?: string; series?: string }> }

export default async function SermonsPage({ searchParams }: Args) {
  const { q, speaker, series } = await searchParams
  const payload = await getPayloadClient()
  // Dataset is small enough that filtering in-memory (after one query) is
  // simpler and cheaper than round-tripping a separate `where` query per
  // filter combination, and lets us derive the speaker/series option lists
  // from the same fetch.
  const sermons = await payload.find({ collection: 'sermons', sort: '-date', limit: 500 })

  const speakers = Array.from(new Set(sermons.docs.map((s) => s.speaker).filter(Boolean))).sort() as string[]
  const seriesList = Array.from(new Set(sermons.docs.map((s) => s.series).filter(Boolean))).sort() as string[]

  const filtered = sermons.docs.filter((s) => {
    if (q && !s.title.toLowerCase().includes(q.toLowerCase())) return false
    if (speaker && s.speaker !== speaker) return false
    if (series && s.series !== series) return false
    return true
  })

  const hasFilters = Boolean(q || speaker || series)

  return (
    <div>
      <PageHeader eyebrow="Media" title="Sermons" description="Recent messages from City of God Christian Centre." />
      <Container className="py-16">
        {sermons.docs.length > 0 ? (
          <>
            <form className="mb-10 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-surface p-5">
              <div className="min-w-[180px] flex-1">
                <label htmlFor="q" className="mb-1 block text-sm font-medium text-ink">
                  Search by title
                </label>
                <input id="q" name="q" type="search" defaultValue={q} placeholder="e.g. Faith" className="input" />
              </div>
              {speakers.length > 0 && (
                <div className="min-w-[160px]">
                  <label htmlFor="speaker" className="mb-1 block text-sm font-medium text-ink">
                    Speaker
                  </label>
                  <select id="speaker" name="speaker" defaultValue={speaker || ''} className="input">
                    <option value="">All speakers</option>
                    {speakers.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {seriesList.length > 0 && (
                <div className="min-w-[160px]">
                  <label htmlFor="series" className="mb-1 block text-sm font-medium text-ink">
                    Series
                  </label>
                  <select id="series" name="series" defaultValue={series || ''} className="input">
                    <option value="">All series</option>
                    {seriesList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  Filter
                </button>
                {hasFilters && (
                  <Link
                    href="/media/sermons"
                    className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-brand-50"
                  >
                    Clear
                  </Link>
                )}
              </div>
            </form>

            {filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((sermon) => {
                  const img = mediaUrl(sermon.thumbnail)
                  return (
                    <Link
                      key={sermon.id}
                      href={`/media/sermons/${sermon.slug}`}
                      className="group overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
                    >
                      <div className="relative aspect-video bg-brand-100">
                        {img && <Image src={img} alt={sermon.title} fill className="object-cover" />}
                      </div>
                      <div className="p-5">
                        <p className="font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                          {sermon.title}
                        </p>
                        <p className="mt-1 text-sm text-ink-muted">
                          {[sermon.speaker, new Date(sermon.date).toLocaleDateString('en-GB')]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        {sermon.series && <p className="mt-1 text-xs text-ink-muted">{sermon.series}</p>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-ink-muted">No sermons match your search. Try clearing a filter.</p>
            )}
          </>
        ) : (
          <p className="text-ink-muted">Sermons will appear here once added in the admin panel.</p>
        )}
      </Container>
    </div>
  )
}
