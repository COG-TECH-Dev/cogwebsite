import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Thank You' }

// Stripe's own webhook (not this page) is what actually marks the donation
// Completed and sends the email confirmation — this page just reassures the
// donor immediately after the redirect back from Checkout, since the
// webhook can take a moment (or, rarely, retry) to land.
export default function DonateSuccessPage() {
  return (
    <div>
      <PageHeader eyebrow="Give" title="Thank You" />
      <Container className="max-w-xl py-16 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </span>
        <h2 className="mt-6 font-serif text-2xl font-semibold text-brand-700">Your gift is on its way</h2>
        <p className="mt-3 text-ink-muted">
          Thank you for your generosity — you&apos;ll receive an email confirmation shortly. If you set up a Gift
          Aid declaration, we&apos;ll take care of claiming it on your behalf.
        </p>
        <Link href="/" className="mt-8 inline-block text-sm font-semibold text-brand-600 hover:underline">
          ← Back to Home
        </Link>
      </Container>
    </div>
  )
}
