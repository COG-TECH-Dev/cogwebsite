import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { publishedOnly } from '@/lib/published'
import { getYouTubeSermon, youtubeThumb, type YouTubeSermon } from '@/lib/sermons'
import { youtubeVideoId } from '@/lib/youtube'
import { YouTubePlayer } from '@/components/site/YouTubePlayer'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

type Args = { params: Promise<{ slug: string }> }

// Videos that come straight from the YouTube channel (not added in the admin)
// are linked as /media/cog-tv/yt-<video id>.
const YT_SLUG = /^yt-([\w-]{11})$/

async function getChannelId() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  return settings?.socialLinks?.youtubeChannelId
}

// A video picked by hand in the admin (Media Gallery Items, shown on COG TV) always opens, even when it is not from
// the church's own channel: someone chose it on purpose. Any other video must belong to the channel.
async function findVideo(id: string): Promise<YouTubeSermon | null> {
  const payload = await getPayloadClient()
  const picked = await payload
    .find({
      collection: 'media-gallery-items',
      where: { and: [{ category: { in: ['cog-tv'] } }, publishedOnly, { videoEmbedUrl: { contains: id } }] },
      limit: 1,
      draft: false,
      depth: 0,
    })
    .then((r) => r.docs[0] ?? null)
    .catch(() => null)
  if (picked) return { id, title: picked.title, speaker: null, seriesLabel: null, date: picked.createdAt, description: '' }
  return getYouTubeSermon(id, await getChannelId(), payload)
}

async function getSermon(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({ collection: 'sermons', where: { slug: { equals: slug } }, limit: 1 })
  return result.docs[0] ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const yt = slug.match(YT_SLUG)
  if (yt) {
    const video = await findVideo(yt[1])
    if (!video) return {}
    return { title: video.title, openGraph: { title: video.title, images: [youtubeThumb(video.id)] } }
  }
  const sermon = await getSermon(slug)
  if (!sermon) return {}
  const thumb = sermon.thumbnail && typeof sermon.thumbnail === 'object' ? sermon.thumbnail.url : null
  return {
    title: sermon.title,
    openGraph: { title: sermon.title, ...(thumb ? { images: [thumb] } : {}) },
  }
}

export default async function SermonPage({ params }: Args) {
  const { slug } = await params
  const yt = slug.match(YT_SLUG)
  if (yt) {
    const video = await findVideo(yt[1])
    if (!video) notFound()
    const when = video.date
      ? new Date(video.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : null
    return (
      <div>
        <PageHeader
          eyebrow={[video.speaker, when].filter(Boolean).join(' · ')}
          title={video.title}
          description={video.seriesLabel ?? undefined}
        />
        <Container className="py-16">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
            <YouTubePlayer videoId={video.id} title={video.title} sizes="(min-width: 1280px) 1152px, 100vw" />
          </div>
          {video.description && (
            <p className="mt-8 max-w-3xl whitespace-pre-line text-ink-muted">{video.description.slice(0, 1200)}</p>
          )}
          <p className="mt-6">
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              Watch on YouTube →
            </a>
          </p>
          <p className="mt-10 border-t border-border pt-6">
            <Link href="/media/cog-tv" className="text-sm font-semibold text-brand-600 hover:underline">
              ← All messages and videos on COG TV
            </Link>
          </p>
          <p className="mt-10 border-t border-border pt-6">
          <Link href="/media/cog-tv" className="text-sm font-semibold text-brand-600 hover:underline">
            ← All messages and videos on COG TV
          </Link>
        </p>
      </Container>
      </div>
    )
  }

  const sermon = await getSermon(slug)
  if (!sermon) notFound()

  const dateLabel = new Date(sermon.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div>
      <PageHeader
        eyebrow={[sermon.speaker, dateLabel].filter(Boolean).join(' · ')}
        title={sermon.title}
        description={sermon.scriptureReference ?? undefined}
      />
      <Container className="py-16">
        {sermon.videoUrl ? (
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
            {youtubeVideoId(sermon.videoUrl) ? (
              <YouTubePlayer
                videoId={youtubeVideoId(sermon.videoUrl)!}
                title={sermon.title}
                sizes="(min-width: 1280px) 1152px, 100vw"
              />
            ) : (
              <iframe src={sermon.videoUrl} className="h-full w-full" allowFullScreen loading="lazy" title={sermon.title} />
            )}
          </div>
        ) : sermon.audioUrl ? (
          <audio controls src={sermon.audioUrl} className="w-full" />
        ) : null}

        {sermon.description && (
          <div className="prose prose-neutral mt-8 max-w-3xl">
            <RichText data={sermon.description} />
          </div>
        )}
      </Container>
    </div>
  )
}
