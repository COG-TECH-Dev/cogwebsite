import { Baby, Car, Clock, Coffee, MapPin, Shirt } from 'lucide-react'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { FirstTimerForm } from '@/components/site/FirstTimerForm'
import { navLinks } from '@/components/site/navLinks'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60
export const metadata = { title: "I'm New Here" }

// Where visitors can park, and the map link the church supplied for it.
const PARKING =
  'You can park in the car park at the back of the church, or nearby at the shopping centre.'
const PARKING_MAP_URL = 'https://maps.app.goo.gl/PWsPPVr7gPtfA8NG8'

export default async function NewHerePage() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const homegroups = (await payload.find({ collection: 'homegroups', limit: 100, sort: 'area', depth: 0 }).catch(() => null))?.docs ?? []
  const sundayServices = (settings?.serviceTimes ?? []).filter((s) => s.label.toLowerCase().includes('sunday'))
  const address = settings?.address
  const addressLine = [address?.line1, address?.city, address?.postcode].filter(Boolean).join(', ')

  const cards: { icon: typeof Clock; title: string; body: string; link?: { href: string; label: string } }[] = [
    {
      icon: Clock,
      title: 'Sunday Service Times',
      body:
        sundayServices.length > 0
          ? sundayServices.map((s) => s.time).join(' · ')
          : 'Service times coming soon.',
    },
    {
      icon: MapPin,
      title: 'Where to Find Us',
      body:
        address?.line1 || address?.city
          ? [address?.line1, [address?.city, address?.postcode].filter(Boolean).join(', ')].filter(Boolean).join(', ')
          : 'Address coming soon.',
      // A plain place search (no fixed start point), so Google Maps offers directions from wherever the visitor is.
      link: addressLine
        ? {
            href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`,
            label: 'Open in Google Maps',
          }
        : undefined,
    },
    {
      icon: Car,
      title: 'Parking',
      body: PARKING,
      link: { href: PARKING_MAP_URL, label: 'See where to park on the map' },
    },
    {
      icon: Shirt,
      title: 'What to Wear',
      body: "There's no dress code here — come as you are, however you feel comfortable.",
    },
    {
      icon: Baby,
      title: "For Your Kids",
      body: 'Sunday school begins at 10:40am, with a dedicated children’s service from 11:00am at the Church Community Hall.',
    },
    {
      icon: Coffee,
      title: 'After the Service',
      body: 'Stick around — we’d love to meet you over refreshments and introduce you to our church family.',
    },
  ]

  return (
    <div>
      <PageHeader
        compact
        eyebrow="Connect"
        title="I'm New Here"
        description="Whether it's your first time or you're looking for a church home, we're glad you're here. Join us this Sunday and experience real community."
      />
      <Container className="py-3 sm:py-16">
        <Reveal className="mx-auto mb-2 max-w-2xl text-center sm:mb-12">
          <p className="text-[0.75rem] leading-snug text-ink-muted sm:text-lg sm:leading-relaxed">
            Our worship is heartfelt, our teaching is Bible-based, and our people are friendly.
            <span className="max-sm:hidden"> Whatever brought you here, there&apos;s a place for you.</span>
          </p>
        </Reveal>

        {/* On a phone the five key facts (times, address and map, parking, dress, kids) read as one slim list so they all
            sit on the first screen; from sm up they are the original cards. */}
        <StaggerGroup className="max-sm:divide-y max-sm:divide-border max-sm:overflow-hidden max-sm:rounded-2xl max-sm:border max-sm:border-border max-sm:bg-surface sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <StaggerItem key={card.title} className="h-full">
                <div className="flex items-start gap-3 px-3.5 py-1.5 sm:block sm:h-full sm:rounded-2xl sm:border sm:border-border sm:bg-surface sm:p-6 sm:shadow-sm">
                  <span className="flex shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-600 max-sm:hidden sm:h-12 sm:w-12 sm:rounded-xl">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 text-[0.8rem] leading-snug sm:text-sm">
                    <h2 className="inline font-serif text-[0.85rem] font-semibold text-brand-700 sm:mt-5 sm:block sm:text-lg">
                      {card.title}
                    </h2>{' '}
                    <p className="inline text-ink-muted sm:mt-2 sm:block sm:leading-relaxed">{card.body}</p>
                    {card.link && (
                      <a
                        href={card.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 block font-semibold text-brand-600 hover:underline sm:mt-3 sm:text-sm"
                      >
                        {card.link.label} <span aria-hidden="true">→</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerGroup>

        <Reveal className="mt-10 rounded-2xl border border-border bg-surface p-6 text-center sm:mt-14 sm:p-8">
          <h2 className="font-serif text-xl font-semibold text-brand-700 sm:text-2xl">New to faith? Start here</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted sm:text-base">
            Plain-language reading for people with no church background, at your own pace. There is nothing to sign up
            for.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/resources#start-here"
              className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-300"
            >
              Beginner resources
            </Link>
            <Link
              href="/connect/next-steps"
              className="rounded-full border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-600 hover:text-white"
            >
              Take a step of faith
            </Link>
          </div>
        </Reveal>

        <Reveal className="mt-6 rounded-2xl border border-border bg-brand-50 p-6 text-center sm:mt-8 sm:p-8">
          <h2 className="font-serif text-xl font-semibold text-brand-700 sm:text-2xl">Get to know us</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted sm:text-base">
            Curious what we believe and where we come from? Read about us at your own pace; there is nothing to sign up
            for.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {[
              { href: '/about/tenets', label: 'What we believe' },
              { href: '/about/vision-mission', label: 'Our vision and mission' },
              { href: '/about/history', label: 'Our story' },
              { href: '/about/leadership', label: 'Meet our leaders' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-600 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </Reveal>

        <div id="visited" className="mx-auto mt-16 max-w-xl scroll-mt-28">
          <Reveal>
            <h2 className="font-serif text-2xl font-semibold text-brand-700 sm:text-3xl">Visited us? Say hello</h2>
            <p className="mt-2 mb-8 text-ink-muted">
              We&apos;d love to know you came and to help you take a next step. These are the same questions as our New
              Member form, so our welcome team can follow you up.
            </p>
            <FirstTimerForm
              campuses={(navLinks.find((l) => l.label === 'Branches')?.children ?? []).map((b) => b.label)}
              homegroups={homegroups.map((g) => ({ id: g.id, area: g.area }))}
            />
          </Reveal>
        </div>

        <Reveal className="mt-16 rounded-3xl bg-brand-50 p-8 text-center sm:p-12">
          <h2 className="font-serif text-2xl font-semibold text-brand-700 sm:text-3xl">Ready to Join Us?</h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-muted">
            We can&apos;t wait to meet you. If you have any questions before Sunday, just reach out.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button href="/connect/contact">Ask a Question</Button>
            <Button href="/connect/prayer-request" variant="secondary">
              Share a Prayer Request
            </Button>
          </div>
        </Reveal>
      </Container>
    </div>
  )
}
