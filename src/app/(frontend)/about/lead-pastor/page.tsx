import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { getPageBySlug } from '@/lib/getPageBySlug'
import { LEAD_PASTOR, welcomeParagraphs } from '@/lib/leadPastor'
import { getPayloadClient } from '@/lib/payload'
import { AboutSubNav } from '@/components/site/AboutSubNav'
import { PlanYourVisitCta } from '@/components/site/PlanYourVisitCta'
import { Button } from '@/components/ui/Button'
import { Glows } from '@/components/ui/BrandVisuals'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'

export const revalidate = 60
export const metadata: Metadata = {
  title: "Pastor's Welcome",
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

// A portrait or half-length photo fills the whole panel edge to edge (a little may be trimmed at the sides). A very tall,
// full-length figure (narrower than about 1 to 2) is shown whole instead, standing on the bottom edge, so no head or feet are cut off.
const fillsPanel = (photo: { width: number; height: number }) => photo.width / photo.height >= 0.5

export default async function LeadPastorPage() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  // One upload serves both pages: if no photo is set under Settings > Lead Pastor page, the photo on his card on the
  // Leadership page (the first person in its team list) is used.
  const leadership = settings?.leadPastor?.photo ? null : await getPageBySlug('leadership').catch(() => null)
  const cardPhoto = leadership?.layout
    ?.flatMap((b) => (b.blockType === 'teamGrid' ? (b.members ?? []).slice(0, 1) : []))
    .find((m) => m.name === LEAD_PASTOR.name)?.photo
  const photo = photoOf(settings?.leadPastor?.photo) ?? photoOf(cardPhoto)
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
        {/* With a photo, the page is split 2 parts picture to 3 parts message, and the picture fills the whole height of the
            message beside it (see fillsPanel above for how it is fitted). */}
        <div className={photo ? 'grid gap-10 lg:grid-cols-5 lg:items-stretch lg:gap-14' : ''}>
          {photo && (
            <Reveal className="lg:col-span-2">
              <div className="relative isolate h-full min-h-[30rem] overflow-hidden rounded-3xl bg-linear-to-br from-brand-900 via-brand-700 to-brand-600 shadow-lg lg:min-h-[36rem]">
                <Glows />
                <Image
                  src={photo.url}
                  alt={`${LEAD_PASTOR.name} and ${LEAD_PASTOR.spouse}`}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className={fillsPanel(photo) ? 'object-cover object-top' : 'object-contain object-bottom px-4 pt-6 drop-shadow-2xl'}
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
