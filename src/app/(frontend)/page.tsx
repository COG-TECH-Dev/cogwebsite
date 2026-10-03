import { DoorOpen, HandCoins, MapPin, Newspaper, Tv } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { upcomingEventsWhere } from '@/lib/eventWindow'
import { publishedOnly } from '@/lib/published'
import { guessMinistryIcon } from '@/lib/guessMinistryIcon'
import { BlockIcon } from '@/components/blocks/BlockIcon'
import { HeroContent } from '@/components/site/HeroContent'
import { YouTubePlayer } from '@/components/site/YouTubePlayer'
import { BrandPanel } from '@/components/ui/BrandVisuals'
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

  const [settings, ministries, events, sermons, testimonials, news] = await Promise.all([
    payload.findGlobal({ slug: 'settings' }).catch(() => null),
    payload.find({ collection: 'ministries', where: { featured: { equals: true } }, limit: 4 }),
    payload.find({
      collection: 'events',
      where: { and: [upcomingEventsWhere(), publishedOnly] },
      sort: 'startDate',
      limit: 3,
      draft: false,
    }),
    payload.find({ collection: 'sermons', sort: '-date', limit: 1 }),
    payload.find({
      collection: 'testimonials',
      where: { and: [{ featured: { equals: true } }, { status: { equals: 'approved' } }] },
      limit: 3,
    }),
    payload.find({
      collection: 'news',
      where: { _status: { equals: 'published' } },
      sort: ['-pinned', '-publishedDate'],
      limit: 3,
      draft: false,
    }),
  ])

  const hero = settings?.homepageHero
  const heroImage = mediaUrl(hero?.backgroundImage)
  const heroVideo = hero?.backgroundVideoUrl
  const serviceTimes = settings?.serviceTimes ?? []
  const youtubeChannelId = settings?.socialLinks?.youtubeChannelId?.trim()
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
        <Container className="relative py-8 text-center sm:py-20">
          <HeroContent>
            <p className="font-serif text-sm uppercase tracking-[0.3em] text-gold-300">
              Welcome Home
            </p>
            <h1 className="mx-auto mt-4 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:mt-6 sm:text-5xl">
              {hero?.headline || 'A Place where God lives and Miracles happen Naturally.'}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:mt-6 sm:text-lg">
              {hero?.tagline ||
                'Join City of God Christian Centre for worship, community, and growth in Newcastle upon Tyne.'}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10">
              <Button href="/connect/new-here" variant="primary">
                Plan Your Visit
              </Button>
              <Button href="/media/sermons" variant="outline">
                Watch Latest Sermon
              </Button>
            </div>
          </HeroContent>
        </Container>
      </section>

      {/* Quick actions — the four things most visitors come for (UX-001) */}
      <section className="border-b border-border bg-surface">
        <Container className="py-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              // Straight to the player further down this page when there is one, rather than off to another page.
              { href: youtubeChannelId ? '#watch-live' : '/media/cog-tv', label: 'Watch Live', hint: 'Join our service online', icon: Tv },
              { href: '/connect/new-here', label: 'Plan Your Visit', hint: 'What to expect', icon: DoorOpen },
              { href: '/give', label: 'Give Online', hint: 'Tithes & offerings', icon: HandCoins },
              { href: '/connect/find-a-campus', label: 'Find a Church', hint: 'Near you', icon: MapPin },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors hover:border-gold-300 hover:bg-brand-50"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-serif font-semibold text-brand-700 group-hover:text-brand-600">
                      {item.label}
                    </span>
                    <span className="block text-xs text-ink-muted">{item.hint}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </Container>
      </section>

      {/* Leadership welcome message */}
      <section className="py-20">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">A Word From Our Leadership</p>
            <p className="mt-6 text-lg leading-relaxed text-ink-muted">
              On behalf of the entire leadership team, welcome to City of God Christian Centre. Whether you are
              joining us for the first time or you have been part of this family for years, we are so glad you are
              here. Our prayer is that you will encounter God&apos;s love, find genuine community, and discover your
              purpose as you journey with us.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Service times */}
      {serviceTimes.length > 0 && (
        <section className="border-b border-border bg-surface">
          <Container className="grid gap-y-3 py-6 text-sm sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-10">
            {serviceTimes.map((service, i) => (
              <div
                key={i}
                className="flex items-baseline justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0 sm:items-center sm:justify-start sm:gap-2 sm:border-b-0 sm:pb-0"
              >
                <span className="font-semibold text-brand-600">{service.label}</span>
                <span className="whitespace-nowrap text-right text-ink-muted sm:text-left">{service.time}</span>
              </div>
            ))}
          </Container>
        </section>
      )}

      {/* Live stream — only once the YouTube channel ID is set in Settings (FR-011) */}
      {youtubeChannelId && (
        <section id="watch-live" className="scroll-mt-24 py-20">
          <Container>
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Watch Live</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-700">Join Us Online</h2>
              <p className="mt-3 text-ink-muted">
                Can&apos;t be with us in person? Worship with us live during our services.
              </p>
              <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl border border-border shadow-lg">
                <YouTubePlayer channelId={youtubeChannelId} title="City of God Christian Centre live stream" />
              </div>
              <p className="mt-4 text-sm text-ink-muted">
                Nothing streaming right now?{' '}
                <Link href="/media/sermons" className="font-semibold text-brand-600 hover:underline">
                  Catch up on past messages →
                </Link>
              </p>
            </Reveal>
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
                const icon = ministry.icon || guessMinistryIcon(ministry.name)
                return (
                  <StaggerItem key={ministry.id}>
                    <Link
                      href={`/ministries/${ministry.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative aspect-4/3">
                        {img ? (
                          <Image src={img} alt={ministry.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                        ) : (
                          <BrandPanel className="absolute inset-0 flex items-center justify-center">
                            <BlockIcon name={icon} className="h-9 w-9 text-gold-300" />
                          </BrandPanel>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                          {ministry.name}
                        </h3>
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
                        <h3 className="font-semibold text-brand-700">{event.title}</h3>
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
                  <h3 className="font-serif text-xl font-semibold text-brand-700">{latestSermon.title}</h3>
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

      {/* Latest news */}
      {news.docs.length > 0 && (
        <section className="py-20">
          <Container>
            <Reveal className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Latest</p>
                <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-700">News &amp; Announcements</h2>
              </div>
              <Link href="/news" className="text-sm font-semibold text-brand-600 hover:underline">
                All news →
              </Link>
            </Reveal>
            <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-3">
              {news.docs.map((post) => (
                <StaggerItem key={post.id} className="h-full">
                  <Link
                    href={`/news/${post.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-600">
                      <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
                      {new Date(post.publishedDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <h3 className="mt-2 font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                      {post.title}
                    </h3>
                    {post.summary && <p className="mt-2 text-sm text-ink-muted">{post.summary}</p>}
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Container>
        </section>
      )}

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
            <p className="mt-8 text-center">
              <Link href="/connect/share-testimony" className="text-sm font-semibold text-brand-600 hover:underline">
                Share your story →
              </Link>
            </p>
          </Container>
        </section>
      )}

      {/* Next steps */}
      <section className="py-24">
        <Container>
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold text-brand-700 sm:text-4xl">Whatever Brought You Here</h2>
            <p className="mt-3 text-ink-muted">There&apos;s a next step for you, wherever you&apos;re starting from.</p>
          </Reveal>
          <StaggerGroup className="grid gap-6 sm:grid-cols-3">
            <StaggerItem>
              <div className="h-full rounded-2xl border border-border bg-surface p-7">
                <h3 className="font-serif text-xl font-semibold text-brand-700">I&apos;m New Here</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Whether it&apos;s your first time or you&apos;re looking for a church home, we&apos;re glad
                  you&apos;re here. Join us this Sunday and experience real community.
                </p>
                <Link href="/connect/new-here" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">
                  Plan your visit →
                </Link>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="h-full rounded-2xl border border-border bg-surface p-7">
                <h3 className="font-serif text-xl font-semibold text-brand-700">Just Visited Us?</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  We&apos;d love to hear from you and help you take your next step.
                </p>
                <Link href="/connect/new-here#visited" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">
                  Let us know →
                </Link>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="h-full rounded-2xl border border-border bg-surface p-7">
                <h3 className="font-serif text-xl font-semibold text-brand-700">Take a Step of Faith</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Whatever brought you here today, God already knows — and He&apos;s inviting you to take the next
                  step. It only takes a moment to respond.
                </p>
                <Link href="/connect/next-steps" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">
                  Respond now →
                </Link>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-700 py-20 text-center text-white">
        <Container>
          <Reveal>
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Join Us This Sunday</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/80">
              We&apos;d love to welcome you. Come as you are.
            </p>
            <div className="mt-8">
              <Button href="/connect/new-here" variant="primary">
                Plan Your Visit
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  )
}
