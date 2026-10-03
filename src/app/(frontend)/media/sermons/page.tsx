import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { getSermonItems } from '@/lib/sermons'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60
export const metadata = { title: 'Sermons' }

type Args = { searchParams: Promise<{ q?: string; speaker?: string; series?: string }> }

export default async function SermonsPage({ searchParams }: Args) {
  const { q, speaker, series } = await searchParams
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  // Sermons added by hand in the admin plus the channel's latest messages (see
  // lib/sermons). Small enough to filter in-memory after one fetch, which also
  // lets the speaker/series option lists come from the same data.
  const sermons = await getSermonItems(payload, settings?.socialLinks?.youtubeChannelId)

  const speakers = Array.from(new Set(sermons.map((s) => s.speaker).filter(Boolean))).sort() as string[]
  const seriesList = Array.from(new Set(sermons.map((s) => s.series).filter(Boolean))).sort() as string[]

  const filtered = sermons.filter((s) => {
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
        {sermons.length > 0 ? (
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
                  const img = sermon.image
                  return (
                    <Link
                      key={sermon.key}
                      href={sermon.href}
                      className="group overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
                    >
                      <div className="relative aspect-video bg-brand-100">
                        {img && (
                          <Image
                            src={img}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="p-5">
                        <h2 className="font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                          {sermon.title}
                        </h2>
                        <p className="mt-1 text-sm text-ink-muted">
                          {[sermon.speaker, new Date(sermon.date).toLocaleDateString('en-GB')]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        {sermon.seriesLabel && <p className="mt-1 text-xs text-ink-muted">{sermon.seriesLabel}</p>}
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
          <p className="text-ink-muted">Sermons will appear here soon.</p>
        )}
      </Container>
    </div>
  )
}
