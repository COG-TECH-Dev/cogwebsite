import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

type Args = { params: Promise<{ slug: string }> }

async function getSermon(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({ collection: 'sermons', where: { slug: { equals: slug } }, limit: 1 })
  return result.docs[0] ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const sermon = await getSermon(slug)
  return { title: sermon?.title }
}

function toEmbedUrl(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

export default async function SermonPage({ params }: Args) {
  const { slug } = await params
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
          <div className="aspect-video overflow-hidden rounded-2xl border border-border">
            <iframe
              src={toEmbedUrl(sermon.videoUrl)}
              className="h-full w-full"
              allowFullScreen
              title={sermon.title}
            />
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
