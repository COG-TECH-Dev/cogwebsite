import type { Metadata } from 'next'
import { Clock, Mail, MapPin, Phone, Users } from 'lucide-react'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'City of God Gateshead',
  description: 'City of God Gateshead is part of the City of God family of churches in the North East, led by Pastor Udu.',
}

const DEFAULT_WELCOME =
  'City of God Gateshead is part of the City of God family of churches in the North East. Pastor Udu shepherds the church family here, and whether it is your first time or you are looking for a church home, you are welcome.'

/**
 * Gateshead's own page: it has no website of its own, so this is its home. The pastor and the Gateshead homegroups
 * come from the rest of the site; the welcome, address, times and contact details are filled in under Settings in the admin,
 * and anything left empty is left off the page.
 */
export default async function GatesheadPage() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const g = settings?.gatesheadChurch
  const homegroups = (
    await payload
      .find({
        collection: 'homegroups',
        where: { or: [{ area: { contains: 'gateshead' } }, { name: { contains: 'gateshead' } }] },
        sort: 'area',
        limit: 20,
        depth: 0,
      })
      .catch(() => null)
  )?.docs ?? []

  const times = (g?.serviceTimes ?? []).filter((t) => t.label && t.time)
  const addressLines = (g?.address ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
  const mapUrl = addressLines.length > 0 ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines.join(', '))}` : null
  const email = g?.contactEmail?.trim()
  const phone = g?.contactPhone?.trim()

  const card = 'rounded-2xl border border-border bg-surface p-6 shadow-sm'
  const iconWrap = 'flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-600'
  const heading = 'mt-5 font-serif text-lg font-semibold text-brand-700'

  return (
    <div>
      <PageHeader
        eyebrow="Our Family of Churches"
        title="City of God Gateshead"
        description="A City of God church family in Gateshead, led by Pastor Udu."
      />
      <Container className="py-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-lg leading-relaxed text-ink-muted">{g?.about?.trim() || DEFAULT_WELCOME}</p>
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StaggerItem className="h-full">
            <div className={`${card} h-full`}>
              <span className={iconWrap}>
                <Clock className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className={heading}>When We Meet</h2>
              {times.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                  {times.map((t, i) => (
                    <li key={i}>
                      <span className="font-medium text-ink">{t.label}</span> · {t.time}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-muted">Service times will be added here soon. Get in touch and we will tell you.</p>
              )}
            </div>
          </StaggerItem>

          <StaggerItem className="h-full">
            <div className={`${card} h-full`}>
              <span className={iconWrap}>
                <MapPin className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className={heading}>Where to Find Us</h2>
              {addressLines.length > 0 ? (
                <>
                  <address className="mt-2 text-sm not-italic text-ink-muted">
                    {addressLines.map((line, i) => (
                      <span key={i} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm font-semibold text-brand-600 hover:underline">
                      Open in Google Maps <span aria-hidden="true">→</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm text-ink-muted">The address will be added here soon. Get in touch and we will point you the right way.</p>
              )}
            </div>
          </StaggerItem>

          <StaggerItem className="h-full">
            <div className={`${card} h-full`}>
              <span className={iconWrap}>
                <Users className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className={heading}>Your Pastor</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Pastor Udu is the pastor of City of God Gateshead, shepherding the church family there.
              </p>
              <Link href="/about/leadership" className="mt-3 block text-sm font-semibold text-brand-600 hover:underline">
                Meet our leaders <span aria-hidden="true">→</span>
              </Link>
            </div>
          </StaggerItem>
        </StaggerGroup>

        {(email || phone) && (
          <Reveal className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
            {email && (
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2 font-medium text-brand-600 hover:underline">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {email}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-2 font-medium text-brand-600 hover:underline">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {phone}
              </a>
            )}
          </Reveal>
        )}

        {homegroups.length > 0 && (
          <section aria-labelledby="gateshead-homegroups" className="mt-16">
            <Reveal>
              <h2 id="gateshead-homegroups" className="font-serif text-2xl font-semibold text-brand-700">
                Homegroups in Gateshead
              </h2>
              <p className="mt-2 text-ink-muted">Small groups meeting through the week for community, prayer and growing in faith together.</p>
            </Reveal>
            <StaggerGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {homegroups.map((group) => (
                <StaggerItem key={group.id} className="h-full">
                  <div className={`${card} flex h-full flex-col`}>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-600">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {group.area}
                    </p>
                    <h3 className="mt-2 font-serif text-lg font-semibold text-brand-700">{group.name}</h3>
                    {group.meetingDay && <p className="mt-1 text-sm text-ink-muted">{group.meetingDay}</p>}
                    <Link href={`/connect/homegroups?group=${group.id}#join`} className="mt-4 text-sm font-semibold text-brand-600 hover:underline">
                      Ask to join <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        )}

        <Reveal className="mt-16 rounded-3xl bg-brand-50 p-8 text-center sm:p-12">
          <h2 className="font-serif text-2xl font-semibold text-brand-700 sm:text-3xl">Visited us? Say hello</h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-muted">
            We would love to know you came. Tell us a little about yourself and our team will be in touch.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button href="/connect/new-here#visited">I&apos;ve Visited — Say Hello</Button>
            <Button href="/connect/contact" variant="secondary">
              Ask a Question
            </Button>
          </div>
        </Reveal>
      </Container>
    </div>
  )
}
