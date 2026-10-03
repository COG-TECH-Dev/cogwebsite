import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { getYouTubeSermon, youtubeThumb } from '@/lib/sermons'
import { youtubeVideoId } from '@/lib/youtube'
import { YouTubePlayer } from '@/components/site/YouTubePlayer'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

type Args = { params: Promise<{ slug: string }> }

// Messages that come straight from the YouTube channel (not added in the admin)
// are linked as /media/sermons/yt-<video id>.
const YT_SLUG = /^yt-([\w-]{11})$/

async function getChannelId() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  return settings?.socialLinks?.youtubeChannelId
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
    const video = await getYouTubeSermon(yt[1], await getChannelId())
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
    const video = await getYouTubeSermon(yt[1], await getChannelId())
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
