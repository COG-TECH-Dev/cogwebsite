import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { LEAD_PASTOR, welcomeParagraphs } from '@/lib/leadPastor'
import { getPayloadClient } from '@/lib/payload'
import { AboutSubNav } from '@/components/site/AboutSubNav'
import { PlanYourVisitCta } from '@/components/site/PlanYourVisitCta'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Our Lead Pastor',
  description: `A welcome from ${LEAD_PASTOR.name} and ${LEAD_PASTOR.spouse}, Lead Pastor of City of God Christian Centre.`,
}

// The photo is shown whole, at the shape it was uploaded in, never cropped.
function photoOf(value: unknown): { url: string; width: number; height: number } | null {
  if (value && typeof value === 'object' && 'url' in value && typeof value.url === 'string') {
    const { width, height } = value as { width?: number | null; height?: number | null }
    return { url: value.url, width: width || 800, height: height || 1000 }
  }
  return null
}

export default async function LeadPastorPage() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const photo = photoOf(settings?.leadPastor?.photo)
  const paragraphs = welcomeParagraphs(settings?.leadPastor?.welcome)
  // The last short line ("God bless you.") sits with the signature rather than in the body text.
  const closing = paragraphs.length > 1 && paragraphs[paragraphs.length - 1].length < 40 ? paragraphs[paragraphs.length - 1] : null
  const body = closing ? paragraphs.slice(0, -1) : paragraphs

  return (
    <div>
      <PageHeader eyebrow="About Us" title={LEAD_PASTOR.name} description={LEAD_PASTOR.title}>
        <AboutSubNav />
      </PageHeader>

      <Container className="py-16">
        <div className={photo ? 'grid items-start gap-10 lg:grid-cols-5 lg:gap-14' : ''}>
          {photo && (
            <Reveal className="lg:col-span-2">
              <div className="overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={photo.url}
                  alt={`${LEAD_PASTOR.name} and ${LEAD_PASTOR.spouse}`}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="h-auto w-full"
                  priority
                />
              </div>
            </Reveal>
          )}

          <Reveal className={photo ? 'lg:col-span-3' : 'mx-auto max-w-2xl'}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">A welcome from our Lead Pastor</p>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-700 sm:text-3xl">
              {LEAD_PASTOR.name} and {LEAD_PASTOR.spouse}
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-muted">
              {body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="mt-8 font-serif text-lg text-brand-700">
              {closing && <span className="block italic">{closing}</span>}
              <span className="mt-1 block font-semibold">{LEAD_PASTOR.name}</span>
              <span className="block font-semibold">and {LEAD_PASTOR.spouse}</span>
            </p>
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-16 max-w-2xl rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
          <h2 className="font-serif text-xl font-semibold text-brand-700">About {LEAD_PASTOR.name}</h2>
          <p className="mt-3 text-ink-muted">{LEAD_PASTOR.about}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/about/leadership">Meet all our pastors</Button>
            <Button href="/connect/new-here" variant="secondary">
              Plan your visit
            </Button>
          </div>
          <p className="mt-5 text-sm text-ink-muted">
            Want to talk or be prayed with?{' '}
            <Link href="/connect/prayer-request" className="font-semibold text-brand-600 hover:underline">
              Share a prayer request
            </Link>
            .
          </p>
        </Reveal>
      </Container>
      <PlanYourVisitCta />
    </div>
  )
}
