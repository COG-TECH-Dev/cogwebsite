import type { Metadata } from 'next'
import { ExternalLink, MapPin } from 'lucide-react'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { CampusConnectForm } from '@/components/site/CampusConnectForm'
import { navLinks } from '@/components/site/navLinks'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Find a Church',
  description: 'City of God churches across the North East and London — and help connecting if you are moving.',
}

export default async function FindACampusPage() {
  // Same list as the "Branches" menu, so the two can never disagree.
  const branches = navLinks.find((l) => l.label === 'Branches')?.children ?? []
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const address = [settings?.address?.line1, settings?.address?.city, settings?.address?.postcode]
    .filter(Boolean)
    .join(', ')

  return (
    <div>
      <PageHeader
        eyebrow="Our Family of Churches"
        title="Find a Church"
        description="Wherever you are, there's a City of God church family to belong to."
      />
      <Container className="py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Reveal key={branch.label}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-serif text-xl font-semibold text-brand-700">{branch.label}</h2>
                {branch.label.startsWith('Newcastle') && address && (
                  <p className="mt-2 flex-1 text-sm text-ink-muted">{address}</p>
                )}
                {branch.external ? (
                  <a
                    href={branch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
                  >
                    Visit their website <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    href={branch.label.startsWith('Newcastle') ? '/connect/new-here' : branch.href}
                    className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline"
                  >
                    {branch.label.startsWith('Newcastle') ? 'Plan your visit →' : 'Learn more →'}
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <div id="moving" className="mx-auto mt-20 max-w-xl scroll-mt-28">
          <Reveal>
            <h2 className="font-serif text-3xl font-semibold text-brand-700">Moving for university or work?</h2>
            <p className="mt-2 mb-8 text-ink-muted">
              Don&apos;t go without a church family. Tell us where you&apos;re headed and we&apos;ll connect you
              with the City of God church closest to you.
            </p>
            <CampusConnectForm campuses={branches.map((b) => b.label)} />
          </Reveal>
        </div>
      </Container>
    </div>
  )
}
