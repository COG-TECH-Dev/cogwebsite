import type { Metadata } from 'next'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { DonateForm } from '@/components/site/DonateForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Give Online' }

export default async function DonatePage() {
  const payload = await getPayloadClient()
  const giving = await payload.findGlobal({ slug: 'giving' }).catch(() => null)
  const funds = (giving?.funds ?? []).filter((f): f is { name: string; description?: string | null; id?: string | null } => Boolean(f.name))
  const branches = (giving?.branches ?? []).filter((b): b is { name: string; id?: string | null } => Boolean(b.name))
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY)

  return (
    <div>
      <PageHeader
        eyebrow="Give"
        title="Give Online"
        description="Give securely by card, as a one-time gift or on a recurring schedule."
      />
      <Container className="max-w-xl py-16">
        {stripeConfigured ? (
          <DonateForm
            branches={branches.map((b) => b.name)}
            funds={funds.map((f) => ({ name: f.name, description: f.description ?? undefined }))}
          />
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center">
            <p className="text-ink-muted">
              Online card giving isn&apos;t set up yet. In the meantime, please use bank transfer.
            </p>
            <Link href="/give" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">
              ← Back to Give
            </Link>
          </div>
        )}
      </Container>
    </div>
  )
}
