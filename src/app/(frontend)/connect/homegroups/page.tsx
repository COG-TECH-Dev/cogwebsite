import type { Metadata } from 'next'
import { Mail, MapPin, Phone } from 'lucide-react'

import { getPayloadClient } from '@/lib/payload'
import { HomegroupJoinForm } from '@/components/site/HomegroupJoinForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60
export const metadata: Metadata = { title: 'Find a Homegroup' }

export default async function HomegroupsPage() {
  const payload = await getPayloadClient()
  const homegroups = await payload.find({ collection: 'homegroups', limit: 100, sort: 'area' })

  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Find a Homegroup"
        description="Small groups meeting throughout the week for community, prayer, and growing in faith together."
      />
      <Container className="py-16">
        {homegroups.docs.length > 0 ? (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homegroups.docs.map((group) => (
              <StaggerItem key={group.id}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-600">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {group.area}
                  </p>
                  <h2 className="mt-2 font-serif text-lg font-semibold text-brand-700">{group.name}</h2>
                  {group.meetingDay && <p className="mt-1 text-sm text-ink-muted">{group.meetingDay}</p>}
                  {group.description && <p className="mt-3 flex-1 text-sm text-ink-muted">{group.description}</p>}
                  <div className="mt-4 space-y-1.5 border-t border-border pt-4">
                    {group.leaderName && <p className="text-sm font-medium text-ink">{group.leaderName}</p>}
                    {group.contactEmail && (
                      <a
                        href={`mailto:${group.contactEmail}`}
                        className="flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                        {group.contactEmail}
                      </a>
                    )}
                    {group.contactPhone && (
                      <a
                        href={`tel:${group.contactPhone}`}
                        className="flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        {group.contactPhone}
                      </a>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <Reveal className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-ink-muted">Homegroups will appear here once added in the admin panel.</p>
          </Reveal>
        )}

        {homegroups.docs.length > 0 && (
          <div id="join" className="mx-auto mt-16 max-w-xl scroll-mt-28">
            <Reveal>
              <h2 className="font-serif text-2xl font-semibold text-brand-700">Join a Homegroup</h2>
              <p className="mt-2 mb-8 text-ink-muted">
                Choose a group below, or tell us you&apos;re not sure and we&apos;ll help you find one near you.
                We&apos;ll call you to get you connected.
              </p>
              <HomegroupJoinForm
                homegroups={homegroups.docs.map((g) => ({ id: g.id, name: g.name, area: g.area }))}
              />
            </Reveal>
          </div>
        )}
      </Container>
    </div>
  )
}
