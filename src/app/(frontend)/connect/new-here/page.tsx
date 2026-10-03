import { Baby, Clock, Coffee, MapPin, Shirt } from 'lucide-react'

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

export default async function NewHerePage() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const sundayServices = (settings?.serviceTimes ?? []).filter((s) => s.label.toLowerCase().includes('sunday'))
  const address = settings?.address

  const cards = [
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
        eyebrow="Connect"
        title="I'm New Here"
        description="Whether it's your first time or you're looking for a church home, we're glad you're here. Join us this Sunday and experience real community."
      />
      <Container className="py-16">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-lg leading-relaxed text-ink-muted">
            Our worship is heartfelt, our teaching is Bible-based, and our people are friendly. Whatever brought you
            here, there&apos;s a place for you.
          </p>
        </Reveal>

        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <StaggerItem key={card.title} className="h-full">
                <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 font-serif text-lg font-semibold text-brand-700">{card.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{card.body}</p>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerGroup>

        <div id="visited" className="mx-auto mt-16 max-w-xl scroll-mt-28">
          <Reveal>
            <h2 className="font-serif text-2xl font-semibold text-brand-700 sm:text-3xl">Visited us? Say hello</h2>
            <p className="mt-2 mb-8 text-ink-muted">
              We&apos;d love to know you came and to help you take a next step. It only takes a minute.
            </p>
            <FirstTimerForm
              campuses={(navLinks.find((l) => l.label === 'Branches')?.children ?? []).map((b) => b.label)}
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
