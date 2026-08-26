import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { HeroContent } from '@/components/site/HeroContent'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [settings, ministries, events, sermons, testimonials] = await Promise.all([
    payload.findGlobal({ slug: 'settings' }).catch(() => null),
    payload.find({ collection: 'ministries', where: { featured: { equals: true } }, limit: 4 }),
    payload.find({
      collection: 'events',
      where: { startDate: { greater_than_equal: new Date().toISOString() } },
      sort: 'startDate',
      limit: 3,
      draft: false,
    }),
    payload.find({ collection: 'sermons', sort: '-date', limit: 1 }),
    payload.find({ collection: 'testimonials', where: { featured: { equals: true } }, limit: 3 }),
  ])

  const hero = settings?.homepageHero
  const heroImage = mediaUrl(hero?.backgroundImage)
  const heroVideo = hero?.backgroundVideoUrl
  const serviceTimes = settings?.serviceTimes ?? []
  const latestSermon = sermons.docs[0]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-700 text-white">
        {heroVideo ? (
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        ) : (
          heroImage && (
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              className="absolute inset-0 object-cover opacity-30"
            />
          )
        )}
        <Container className="relative py-28 text-center sm:py-36">
          <HeroContent>
            <p className="font-serif text-sm uppercase tracking-[0.3em] text-gold-300">
              Welcome Home
            </p>
            <h1 className="mx-auto mt-6 max-w-3xl font-serif text-5xl font-semibold leading-tight sm:text-6xl">
              {hero?.headline || 'A Place to Belong, Believe, and Become'}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
              {hero?.tagline ||
                'Join City of God Christian Centre for worship, community, and growth in Newcastle upon Tyne.'}
            </p>
            <p className="mx-auto mt-3 max-w-xl font-serif text-lg italic text-gold-300">
              {hero?.declarationLine || 'A Place where God lives and Miracles happen Naturally.'}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button href="/connect" variant="primary">
                Plan Your Visit
              </Button>
              <Button href="/media/sermons" variant="outline">
                Watch Latest Sermon
              </Button>
            </div>
          </HeroContent>
        </Container>
      </section>

      {/* Service times */}
      {serviceTimes.length > 0 && (
        <section className="border-b border-border bg-surface">
          <Container className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-6 text-sm">
            {serviceTimes.map((service, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-semibold text-brand-600">{service.label}</span>
                <span className="text-ink-muted">{service.time}</span>
              </div>
            ))}
          </Container>
        </section>
      )}

      {/* Declaration */}
      <section className="bg-brand-50 py-20">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
              Our Declaration
            </p>
            <p className="mt-6 font-serif text-2xl italic leading-relaxed text-brand-700 sm:text-3xl">
              &ldquo;We are the light of the world. We stand on the Word and we cannot be moved.
              Wherever we go, we shine bright by the Spirit of God — a city set on a hill, the City
              of God.&rdquo;
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Highlighted ministries */}
      <section className="py-24">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">
                Get Involved
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-700">
                Find Your Ministry
              </h2>
            </div>
            <Link href="/ministries" className="text-sm font-semibold text-brand-600 hover:underline">
              View all ministries →
            </Link>
          </Reveal>

          {ministries.docs.length > 0 ? (
            <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {ministries.docs.map((ministry) => {
                const img = mediaUrl(ministry.image)
                return (
                  <StaggerItem key={ministry.id}>
                    <Link
                      href={`/ministries/${ministry.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative aspect-4/3 bg-brand-50">
                        {img && (
                          <Image src={img} alt={ministry.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="p-5">
                        <p className="font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                          {ministry.name}
                        </p>
                        {ministry.summary && (
                          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{ministry.summary}</p>
                        )}
                      </div>
                    </Link>
                  </StaggerItem>
                )
              })}
            </StaggerGroup>
          ) : (
            <p className="mt-10 text-ink-muted">Ministries will appear here once added in the admin panel.</p>
          )}
        </Container>
      </section>

      {/* Upcoming events + latest sermon */}
      <section className="bg-brand-50 py-24">
        <Container className="grid gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">What&apos;s On</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-700">Upcoming Events</h2>

            {events.docs.length > 0 ? (
              <ul className="mt-8 space-y-4">
                {events.docs.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/programmes/${event.slug}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div>
                        <p className="font-semibold text-brand-700">{event.title}</p>
                        {event.location && <p className="text-sm text-ink-muted">{event.location}</p>}
                      </div>
                      <span className="shrink-0 text-sm font-medium text-gold-600">
                        {new Date(event.startDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-8 text-ink-muted">No upcoming events scheduled yet — check back soon.</p>
            )}

            <Link href="/programmes" className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:underline">
              See all programmes →
            </Link>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Listen In</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-700">Latest Sermon</h2>

            {latestSermon ? (
              <Link
                href={`/media/sermons/${latestSermon.slug}`}
                className="mt-8 block overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-video bg-brand-100">
                  {mediaUrl(latestSermon.thumbnail) && (
                    <Image
                      src={mediaUrl(latestSermon.thumbnail)!}
                      alt={latestSermon.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <p className="font-serif text-xl font-semibold text-brand-700">{latestSermon.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {[latestSermon.speaker, new Date(latestSermon.date).toLocaleDateString('en-GB')]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </Link>
            ) : (
              <p className="mt-8 text-ink-muted">Sermons will appear here once added in the admin panel.</p>
            )}
          </Reveal>
        </Container>
      </section>

      {/* Testimonials */}
      {testimonials.docs.length > 0 && (
        <section className="py-24">
          <Container>
            <Reveal>
              <h2 className="text-center font-serif text-3xl font-semibold text-brand-700">
                Stories from Our Family
              </h2>
            </Reveal>
            <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.docs.map((testimonial) => (
                <StaggerItem key={testimonial.id}>
                  <blockquote className="h-full rounded-2xl border border-border bg-surface p-6">
                    <p className="text-ink-muted">&ldquo;{testimonial.quote}&rdquo;</p>
                    <footer className="mt-4 font-semibold text-brand-700">{testimonial.name}</footer>
                  </blockquote>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Container>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-brand-700 py-20 text-center text-white">
        <Container>
          <Reveal>
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Join Us This Sunday</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/80">
              We&apos;d love to welcome you. Come as you are.
            </p>
            <div className="mt-8">
              <Button href="/connect" variant="primary">
                Plan Your Visit
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  )
}
