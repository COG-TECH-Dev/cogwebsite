import type { Metadata } from 'next'
import { HandHeart } from 'lucide-react'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Prayer Wall',
  description: 'Prayer requests our church family has asked us to share. Pray with us.',
}

export default async function PrayerWallPage() {
  const payload = await getPayloadClient()
  // Only requests the person chose to make public AND our team has approved.
  // Only the first name and the request text ever leave this query's results —
  // never email, phone, or surname.
  const requests = await payload.find({
    collection: 'prayer-requests',
    where: { and: [{ visibility: { equals: 'public' } }, { approved: { equals: true } }] },
    sort: '-createdAt',
    limit: 60,
  })

  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Prayer Wall"
        description="Requests our church family has asked us to share. Take a moment to pray for someone here."
      />
      <Container className="py-16">
        {requests.docs.length > 0 ? (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {requests.docs.map((r) => (
              <StaggerItem key={r.id} className="h-full">
                <figure className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <HandHeart className="h-5 w-5 text-gold-600" aria-hidden="true" />
                  <blockquote className="mt-3 flex-1 text-ink-muted">{r.request}</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-brand-700">
                    — {r.name.trim().split(/\s+/)[0]}
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <p className="text-ink-muted">No requests on the wall right now.</p>
        )}

        <div className="mx-auto mt-16 max-w-xl rounded-3xl bg-brand-50 p-8 text-center">
          <h3 className="font-serif text-xl font-semibold text-brand-700">Need prayer?</h3>
          <p className="mt-2 text-sm text-ink-muted">
            Share a request privately, with our ministry team, or here on the wall. Anything for the wall is read
            by our team first.
          </p>
          <Link href="/connect/prayer-request" className="btn-primary mt-5 inline-flex">
            Share a Prayer Request
          </Link>
        </div>
      </Container>
    </div>
  )
}
