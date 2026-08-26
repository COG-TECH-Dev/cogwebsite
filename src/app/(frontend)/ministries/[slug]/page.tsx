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

async function getMinistry(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({ collection: 'ministries', where: { slug: { equals: slug } }, limit: 1 })
  return result.docs[0] ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const ministry = await getMinistry(slug)
  return { title: ministry?.name }
}

export default async function MinistryPage({ params }: Args) {
  const { slug } = await params
  const ministry = await getMinistry(slug)
  if (!ministry) notFound()

  const img = mediaUrl(ministry.image)

  return (
    <div>
      <PageHeader eyebrow="Ministry" title={ministry.name} description={ministry.summary ?? undefined} />
      <Container className="grid gap-10 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {img && (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-brand-50">
              <Image src={img} alt={ministry.name} fill className="object-cover" />
            </div>
          )}
          {ministry.description && (
            <div className="prose prose-neutral max-w-none">
              <RichText data={ministry.description} />
            </div>
          )}
        </div>
        <aside>
          {ministry.leaderName && (
            <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Led By</p>
              <p className="mt-1 font-semibold text-brand-700">{ministry.leaderName}</p>
            </div>
          )}
          {ministry.meetingTimes && ministry.meetingTimes.length > 0 && (
            <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Meeting Times</p>
              <ul className="mt-3 space-y-2 text-sm">
                {ministry.meetingTimes.map((mt, i) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span>{mt.label}</span>
                    <span className="text-ink-muted">{mt.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-2xl bg-brand-700 p-6 text-center text-white">
            <p className="font-serif text-lg font-semibold">Want to get involved?</p>
            <p className="mt-1 text-sm text-white/70">We&apos;d love to have you join us.</p>
            <Button href="/connect/membership" className="mt-4 w-full">
              Join This Ministry
            </Button>
          </div>
        </aside>
      </Container>
    </div>
  )
}
