import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

type Args = { params: Promise<{ slug: string }> }

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

async function getEvent(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    limit: 1,
    draft: false,
  })
  return result.docs[0] ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  return { title: event?.title }
}

export default async function EventPage({ params }: Args) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  const img = mediaUrl(event.featuredImage)
  const dateLabel = new Date(event.startDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <PageHeader eyebrow={dateLabel} title={event.title} description={event.location ?? undefined} />
      <Container className="py-16">
        {img && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-brand-50">
            <Image src={img} alt={event.title} fill className="object-cover" />
          </div>
        )}
        {event.description && (
          <div className="prose prose-neutral max-w-3xl">
            <RichText data={event.description} />
          </div>
        )}
        {event.externalRegistrationLink && (
          <div className="mt-8">
            <Button href={event.externalRegistrationLink}>Register</Button>
          </div>
        )}
      </Container>
    </div>
  )
}
