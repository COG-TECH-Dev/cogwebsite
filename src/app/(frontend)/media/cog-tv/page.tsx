import { Tv } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { publishedOnly } from '@/lib/published'
import { getSermonItems, tvHref, youtubeThumb, type SermonItem } from '@/lib/sermons'
import { youtubeVideoId } from '@/lib/youtube'
import { YouTubePlayer } from '@/components/site/YouTubePlayer'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60
export const metadata = { title: 'COG TV' }

type Args = { searchParams: Promise<{ q?: string; speaker?: string; series?: string }> }

/**
 * COG TV: the live stream, then every message and video in one searchable list (this is also where the old
 * Sermons page went). Messages added in the admin and the YouTube channel's videos share the list, with the
 * speaker and series filters; videos picked by hand under Media Gallery Items join it too.
 */
export default async function CogTvPage({ searchParams }: Args) {
  const { q, speaker, series } = await searchParams
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const channelId = settings?.socialLinks?.youtubeChannelId

  const [tvItems, picked] = await Promise.all([
    getSermonItems(payload, channelId, { includeOtherVideos: true }),
    payload.find({
      collection: 'media-gallery-items',
      where: { and: [{ category: { in: ['cog-tv'] } }, publishedOnly] },
      limit: 50,
      draft: false,
    }),
  ])

  // Videos picked by hand: a YouTube link joins the list under the title chosen in the admin (and replaces
  // the channel's own copy of it); any other kind of video link is shown as an embedded player below.
  const pickedItems: SermonItem[] = []
  const embeds: { id: number; title: string; url: string }[] = []
  for (const item of picked.docs) {
    const id = item.videoEmbedUrl ? youtubeVideoId(item.videoEmbedUrl) : null
    if (id) {
      pickedItems.push({
        key: `picked-${item.id}`,
        title: item.title,
        speaker: null,
        series: null,
        seriesLabel: null,
        date: item.createdAt,
        href: tvHref(`yt-${id}`),
        image: youtubeThumb(id),
        source: 'picked',
      })
    } else if (item.videoEmbedUrl) {
      embeds.push({ id: item.id, title: item.title, url: item.videoEmbedUrl })
    }
  }
  const pickedHrefs = new Set(pickedItems.map((p) => p.href))
  const items = [...tvItems.filter((i) => !pickedHrefs.has(i.href)), ...pickedItems].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

  const speakers = Array.from(new Set(items.map((s) => s.speaker).filter(Boolean))).sort() as string[]
  const seriesList = Array.from(new Set(items.map((s) => s.series).filter(Boolean))).sort() as string[]

  const filtered = items.filter((s) => {
    if (q && !s.title.toLowerCase().includes(q.toLowerCase())) return false
    if (speaker && s.speaker !== speaker) return false
    if (series && s.series !== series) return false
    return true
  })
  // Embedded videos have no speaker or series, so they only appear when those filters are off.
  const shownEmbeds = embeds.filter((e) => !speaker && !series && (!q || e.title.toLowerCase().includes(q.toLowerCase())))
  const hasFilters = Boolean(q || speaker || series)

  return (
    <div>
      <PageHeader eyebrow="Media" title="COG TV" description="Watch live, and catch up on messages and videos from City of God Christian Centre." />
      <Container className="py-16">
        {channelId && (
          <section aria-labelledby="live-heading" className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <Tv className="h-5 w-5 text-gold-600" aria-hidden="true" />
              <h2 id="live-heading" className="font-serif text-xl font-semibold text-brand-700">
                Watch Live
              </h2>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border shadow-lg">
              <YouTubePlayer channelId={channelId} title="City of God Christian Centre live stream" />
            </div>
            <p className="mt-3 text-sm text-ink-muted">Nothing streaming right now? Check back during a service, or browse past messages below.</p>
          </section>
        )}

        {items.length > 0 || shownEmbeds.length > 0 || embeds.length > 0 ? (
          <>
            <h2 className="sr-only">Messages and videos</h2>
            <form action="/media/cog-tv" role="search" aria-label="Search messages and videos" className="mb-10 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-surface p-5">
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
                    href="/media/cog-tv"
                    className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-brand-50"
                  >
                    Clear
                  </Link>
                )}
              </div>
            </form>

            {filtered.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="group overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-video bg-brand-100">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">{item.title}</h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {[item.speaker, new Date(item.date).toLocaleDateString('en-GB')].filter(Boolean).join(' · ')}
                      </p>
                      {item.seriesLabel && <p className="mt-1 text-xs text-ink-muted">{item.seriesLabel}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {shownEmbeds.length > 0 && (
              <section aria-labelledby="more-videos-heading" className={filtered.length > 0 ? 'mt-12' : undefined}>
                <h2 id="more-videos-heading" className="mb-6 font-serif text-xl font-semibold text-brand-700">
                  More videos
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {shownEmbeds.map((e) => (
                    <div key={e.id} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                      <div className="relative aspect-video">
                        <iframe src={e.url} className="h-full w-full" allowFullScreen loading="lazy" title={e.title} />
                      </div>
                      <p className="p-4 font-medium text-brand-700">{e.title}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filtered.length === 0 && shownEmbeds.length === 0 && (
              <p className="text-ink-muted">Nothing matches your search. Try clearing a filter.</p>
            )}
          </>
        ) : (
          <p className="text-ink-muted">Messages and videos will appear here soon.</p>
        )}
      </Container>
    </div>
  )
}
