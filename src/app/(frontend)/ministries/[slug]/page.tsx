import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { Clock, UserRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { guessMinistryIcon } from '@/lib/guessMinistryIcon'
import { BlockIcon } from '@/components/blocks/BlockIcon'
import { ChildrenMinistryForms } from '@/components/site/ChildrenMinistryForms'
import { BrandPanel } from '@/components/ui/BrandVisuals'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'

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

async function getOtherMinistries(excludeId: number) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'ministries',
    where: { id: { not_equals: excludeId } },
    limit: 3,
    sort: 'name',
  })
  return result.docs
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const ministry = await getMinistry(slug)
  if (!ministry) return {}
  const img = mediaUrl(ministry.image)
  return {
    title: ministry.name,
    description: ministry.summary ?? undefined,
    openGraph: {
      title: ministry.name,
      description: ministry.summary ?? undefined,
      ...(img ? { images: [img] } : {}),
    },
  }
}

export default async function MinistryPage({ params }: Args) {
  const { slug } = await params
  const ministry = await getMinistry(slug)
  if (!ministry) notFound()

  const img = mediaUrl(ministry.image)
  const icon = ministry.icon || guessMinistryIcon(ministry.name)
  const others = await getOtherMinistries(ministry.id)
  const safeguardingOn = Boolean(
    ministry.isChildrensMinistry &&
      (await (await getPayloadClient()).findGlobal({ slug: 'settings' }).catch(() => null))?.safeguarding?.enabled,
  )

  return (
    <div>
      <PageHeader eyebrow="Ministry" title={ministry.name} description={ministry.summary ?? undefined} />
      <Container className="grid gap-10 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Reveal>
            <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl shadow-lg">
              {img ? (
                <Image src={img} alt={ministry.name} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
              ) : (
                <BrandPanel className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 backdrop-blur">
                    <BlockIcon name={icon} className="h-12 w-12 text-gold-300" />
                  </span>
                </BrandPanel>
              )}
            </div>
            {ministry.description ? (
              <div className="prose prose-neutral max-w-none">
                <RichText data={ministry.description} />
              </div>
            ) : (
              ministry.summary && <p className="text-lg leading-relaxed text-ink-muted">{ministry.summary}</p>
            )}
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <aside className="space-y-6 lg:sticky lg:top-28">
            {ministry.leaderName && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-600">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Led By
                </p>
                <h2 className="mt-2 font-serif text-lg font-semibold text-brand-700">{ministry.leaderName}</h2>
              </div>
            )}
            {ministry.meetingTimes && ministry.meetingTimes.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-600">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  Meeting Times
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {ministry.meetingTimes.map((mt, i) => (
                    <li key={i} className="flex justify-between gap-4">
                      <span className="font-medium text-ink">{mt.label}</span>
                      <span className="text-ink-muted">{mt.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-brand-900 via-brand-700 to-brand-600 p-6 text-center text-white">
              <p className="font-serif text-lg font-semibold">Want to get involved?</p>
              <p className="mt-1 text-sm text-white/70">We&apos;d love to have you join us.</p>
              <Button href={`/connect/membership?ministry=${ministry.id}`} className="mt-4 w-full">
                Join This Ministry
              </Button>
            </div>
          </aside>
        </Reveal>
      </Container>

      {ministry.isChildrensMinistry && (
        <div className="bg-linear-to-br from-sky-400 via-sky-500 to-orange-400">
          <Container className="py-16">
            <div className="mx-auto max-w-3xl text-center text-white">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">Keeping Your Child Safe</p>
              <h2 className="mt-2 font-serif text-3xl font-bold">Consent, Volunteering & Registration</h2>
              <p className="mt-3 text-white/90">
                Your child&apos;s safety is our top priority. Use the forms below to give photo consent, express
                interest in volunteering with our children&apos;s team, or pre-register your child before your
                first visit.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-2xl">
              <ChildrenMinistryForms />
              {safeguardingOn && (
                <p className="mt-6 text-center text-sm text-white/90">
                  Read how we keep children safe, or raise a concern, on our{' '}
                  <Link href="/safeguarding" className="font-semibold underline">
                    Safeguarding page
                  </Link>
                  .
                </p>
              )}
            </div>
          </Container>
        </div>
      )}

      {others.length > 0 && (
        <div className="border-t border-border bg-brand-50">
          <Container className="py-16">
            <h2 className="mb-8 font-serif text-2xl font-semibold text-brand-700">Explore Other Ministries</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {others.map((other) => {
                const otherImg = mediaUrl(other.image)
                const otherIcon = other.icon || guessMinistryIcon(other.name)
                return (
                  <Link
                    key={other.id}
                    href={`/ministries/${other.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-video">
                      {otherImg ? (
                        <Image src={otherImg} alt="" fill sizes="33vw" className="object-cover" />
                      ) : (
                        <BrandPanel className="absolute inset-0 flex items-center justify-center">
                          <BlockIcon name={otherIcon} className="h-8 w-8 text-gold-300" />
                        </BrandPanel>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif font-semibold text-brand-700 group-hover:text-brand-600">{other.name}</h3>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Container>
        </div>
      )}
    </div>
  )
}
