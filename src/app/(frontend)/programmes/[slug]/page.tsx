import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { Calendar, MapPin, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { formatEventDateRange, TYPE_ICONS, TYPE_LABELS } from '@/lib/eventDisplay'
import { upcomingEventsWhere } from '@/lib/eventWindow'
import { publishedOnly } from '@/lib/published'
import { BlockIcon } from '@/components/blocks/BlockIcon'
import { BrandPanel } from '@/components/ui/BrandVisuals'
import { Button } from '@/components/ui/Button'
import { EventRegistrationForm } from '@/components/site/EventRegistrationForm'
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

async function getEvent(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    where: { and: [{ slug: { equals: slug } }, publishedOnly] },
    limit: 1,
    draft: false,
  })
  return result.docs[0] ?? null
}

async function getOtherEvents(excludeId: number) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    where: { and: [{ id: { not_equals: excludeId } }, upcomingEventsWhere(), publishedOnly] },
    sort: 'startDate',
    limit: 3,
    draft: false,
  })
  return result.docs
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return {}
  const img = mediaUrl(event.featuredImage)
  return {
    title: event.title,
    openGraph: { title: event.title, ...(img ? { images: [img] } : {}) },
  }
}

export default async function EventPage({ params }: Args) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  const img = mediaUrl(event.featuredImage)
  const icon = TYPE_ICONS[event.type] ?? 'compass'
  const ministry = typeof event.relatedMinistry === 'object' ? event.relatedMinistry : null
  const others = await getOtherEvents(event.id)

  let spotsRemaining: number | null = null
  let isFull = false
  if (event.registrationEnabled && event.capacity) {
    const payload = await getPayloadClient()
    const registrations = await payload.find({
      collection: 'event-registrations',
      where: { event: { equals: event.id } },
      limit: 0,
    })
    // Volunteers do not take up attendee places.
    const taken = registrations.docs
      .filter((r) => r.role !== 'volunteer')
      .reduce((sum, r) => sum + (typeof r.guests === 'number' ? r.guests : 1), 0)
    spotsRemaining = Math.max(event.capacity - taken, 0)
    isFull = spotsRemaining <= 0
  }

  const canAttend = Boolean(event.registrationEnabled) && !isFull
  const canVolunteer = Boolean(event.volunteerEnabled)
  const heading = event.registrationEnabled && canVolunteer ? 'Join In' : canVolunteer ? 'Volunteer With Us' : 'Reserve Your Spot'

  return (
    <div>
      <PageHeader
        eyebrow={TYPE_LABELS[event.type] ?? event.type}
        title={event.title}
        description={formatEventDateRange(event.startDate, event.endDate)}
      />
      <Container className="py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Reveal>
              <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl shadow-lg">
                {img ? (
                  <Image src={img} alt={event.title} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
                ) : (
                  <BrandPanel className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 backdrop-blur">
                      <BlockIcon name={icon} className="h-12 w-12 text-gold-300" />
                    </span>
                  </BrandPanel>
                )}
              </div>
              {event.description && (
                <div className="prose prose-neutral max-w-none">
                  <RichText data={event.description} />
                </div>
              )}
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <aside className="space-y-6 lg:sticky lg:top-28">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-600">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Date
                </p>
                <p className="mt-2 font-semibold text-brand-700">{formatEventDateRange(event.startDate, event.endDate)}</p>
                {event.timeLabel && <p className="mt-1 text-sm text-ink-muted">{event.timeLabel}</p>}
              </div>
              {event.location && (
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-600">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    Location
                  </p>
                  <p className="mt-2 font-semibold text-brand-700">{event.location}</p>
                </div>
              )}
              {ministry && (
                <Link
                  href={`/ministries/${ministry.slug}`}
                  className="group block rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-gold-300"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-600">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    Hosted By
                  </p>
                  <p className="mt-2 font-semibold text-brand-700 group-hover:text-brand-600">{ministry.name} →</p>
                </Link>
              )}
              {event.registrationEnabled || canVolunteer ? (
                <div
                  id="rsvp"
                  className="relative isolate scroll-mt-28 overflow-hidden rounded-2xl bg-linear-to-br from-brand-900 via-brand-700 to-brand-600 p-6 text-center text-white"
                >
                  <p className="font-serif text-lg font-semibold">{heading}</p>
                  {canVolunteer && (
                    <p className="mt-1 text-sm text-white/80">
                      {event.registrationEnabled ? 'Come along, or give a hand.' : 'We need helpers for this event.'}
                    </p>
                  )}
                  {event.registrationEnabled && spotsRemaining !== null && (
                    <p className="mt-1 text-sm text-white/80">
                      {isFull ? 'Fully booked' : `${spotsRemaining} spot${spotsRemaining === 1 ? '' : 's'} left`}
                    </p>
                  )}
                  {isFull && (
                    <p className="mt-4 text-sm text-white/90">
                      This event is fully booked.{canVolunteer ? ' You can still offer to volunteer below.' : ' Contact us if a spot opens up.'}
                    </p>
                  )}
                  {(canAttend || canVolunteer) && (
                    <EventRegistrationForm eventId={event.id} canAttend={canAttend} canVolunteer={canVolunteer} />
                  )}
                  {event.externalRegistrationLink && (
                    <Button href={event.externalRegistrationLink} variant="outline" className="mt-4 w-full">
                      Register Externally
                    </Button>
                  )}
                </div>
              ) : (
                event.externalRegistrationLink && (
                  <div className="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-brand-900 via-brand-700 to-brand-600 p-6 text-center text-white">
                    <p className="font-serif text-lg font-semibold">Ready to join us?</p>
                    <Button href={event.externalRegistrationLink} className="mt-4 w-full">
                      Register
                    </Button>
                  </div>
                )
              )}
            </aside>
          </Reveal>
        </div>
      </Container>

      {others.length > 0 && (
        <div className="border-t border-border bg-brand-50">
          <Container className="py-16">
            <h2 className="mb-8 font-serif text-2xl font-semibold text-brand-700">More Upcoming Events</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {others.map((other) => {
                const otherImg = mediaUrl(other.featuredImage)
                const otherIcon = TYPE_ICONS[other.type] ?? 'compass'
                return (
                  <Link
                    key={other.id}
                    href={`/programmes/${other.slug}`}
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
                      <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                        {formatEventDateRange(other.startDate, other.endDate)}
                      </p>
                      <h3 className="mt-1 font-serif font-semibold text-brand-700 group-hover:text-brand-600">
                        {other.title}
                      </h3>
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
