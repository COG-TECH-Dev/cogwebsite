import type { Metadata } from 'next'
import { Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { HomegroupJoinForm } from '@/components/site/HomegroupJoinForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60
export const metadata: Metadata = { title: 'Find a Homegroup' }

type Args = { searchParams: Promise<{ q?: string; group?: string }> }

export default async function HomegroupsPage({ searchParams }: Args) {
  const sp = await searchParams
  const query = (sp.q ?? '').trim().slice(0, 80)
  const payload = await getPayloadClient()
  const all = await payload.find({ collection: 'homegroups', limit: 100, sort: 'area' })
  // A short list, so match in memory on the area, name, leader and meeting day.
  const needle = query.toLowerCase()
  const homegroups = {
    docs: needle
      ? all.docs.filter((g) => [g.area, g.name, g.leaderName, g.meetingDay].some((v) => v?.toLowerCase().includes(needle)))
      : all.docs,
  }
  // "Contact the group leader" links here with ?group=<id> so the form opens with that group chosen.
  const chosen = sp.group && /^\d+$/.test(sp.group) ? Number(sp.group) : undefined
  const chosenId = chosen && all.docs.some((g) => g.id === chosen) ? chosen : undefined

  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Find a Homegroup"
        description="Small groups meeting throughout the week for community, prayer, and growing in faith together."
      />
      <Container className="py-16">
        {all.docs.length > 0 && (
          <form
            action="/connect/homegroups"
            role="search"
            aria-label="Search homegroups"
            className="mb-10 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-surface p-5"
          >
            <div className="min-w-[200px] flex-1">
              <label htmlFor="q" className="mb-1 block text-sm font-medium text-ink">
                Find a homegroup near you
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Type your area, e.g. Gateshead"
                className="input"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Search
              </button>
              {query && (
                <Link
                  href="/connect/homegroups"
                  className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-brand-50"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        )}

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
                  <Link
                    href={`/connect/homegroups?${new URLSearchParams({ ...(query ? { q: query } : {}), group: String(group.id) }).toString()}#join`}
                    className="mt-4 inline-flex w-fit items-center rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-600 hover:text-white"
                  >
                    Contact the group leader
                    <span className="sr-only"> for {group.name}</span>
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : query ? (
          <Reveal className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-ink-muted">
              No homegroups match &ldquo;{query}&rdquo;. Try a nearby area, or{' '}
              <Link href="/connect/homegroups" className="font-medium text-brand-600 underline hover:text-brand-700">
                see them all
              </Link>
              . You can also use the form below and we&apos;ll help you find one.
            </p>
          </Reveal>
        ) : (
          <Reveal className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-ink-muted">Homegroups will appear here once added in the admin panel.</p>
          </Reveal>
        )}

        {all.docs.length > 0 && (
          <div id="join" className="mx-auto mt-16 max-w-xl scroll-mt-28">
            <Reveal>
              <h2 className="font-serif text-2xl font-semibold text-brand-700">Join a Homegroup</h2>
              <p className="mt-2 mb-8 text-ink-muted">
                Choose a group below, or tell us you&apos;re not sure and we&apos;ll help you find one near you.
                We&apos;ll call you to get you connected.
              </p>
              <HomegroupJoinForm
                key={chosenId ?? 'none'}
                defaultGroupId={chosenId}
                homegroups={all.docs.map((g) => ({ id: g.id, name: g.name, area: g.area }))}
              />
            </Reveal>
          </div>
        )}
      </Container>
    </div>
  )
}
