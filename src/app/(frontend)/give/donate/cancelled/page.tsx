import type { Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Giving Cancelled' }

export default function DonateCancelledPage() {
  return (
    <div>
      <PageHeader eyebrow="Give" title="No Payment Was Made" />
      <Container className="max-w-xl py-16 text-center">
        <p className="text-ink-muted">
          You cancelled before completing your gift — nothing was charged. You&apos;re welcome to try again
          whenever you&apos;re ready.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/give/donate" className="btn-primary">
            Try Again
          </Link>
          <Link
            href="/give"
            className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-ink hover:bg-brand-50"
          >
            Back to Give
          </Link>
        </div>
      </Container>
    </div>
  )
}
