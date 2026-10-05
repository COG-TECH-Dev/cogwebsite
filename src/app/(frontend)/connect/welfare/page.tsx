import type { Metadata } from 'next'

import { submitEnquiry } from '@/app/(frontend)/connect/actions'
import { HELPLINES } from '@/lib/helplines'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Welfare & Support' }

export default function WelfarePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Welfare & Support"
        description="If you're going through a difficult time, we're here to help — discreetly and without judgement."
      />
      <Container className="max-w-xl py-16">
        <p className="mb-8 text-ink-muted">
          Whether it&apos;s a financial hardship, a need for counselling, or practical help like food, let us
          know below. This isn&apos;t shared publicly — only our welfare team sees what you submit, and someone
          will follow up with you directly.
        </p>
        <section aria-labelledby="helplines-heading" className="mb-10 rounded-2xl border border-border bg-brand-50 p-6">
          <h2 id="helplines-heading" className="font-serif text-xl font-semibold text-brand-700">
            Need help right now?
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            These national services are free to call or text. They are not run by the church.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {HELPLINES.map((h) => (
              <li key={h.name} className="rounded-xl bg-surface p-4">
                <p className="text-sm font-semibold text-ink">{h.name}</p>
                <a href={h.href} className="mt-0.5 inline-block font-semibold text-brand-600 hover:underline">
                  {h.number}
                </a>
                <p className="mt-1 text-xs text-ink-muted">{h.about}</p>
              </li>
            ))}
          </ul>
        </section>
        <h2 className="mb-3 font-serif text-xl font-semibold text-brand-700">Ask our welfare team for support</h2>
        <EnquiryForm
          action={submitEnquiry.bind(null, 'welfare')}
          showSupportType
          submitLabel="Request Support"
        />
      </Container>
    </div>
  )
}
