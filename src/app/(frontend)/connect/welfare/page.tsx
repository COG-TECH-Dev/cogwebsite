import type { Metadata } from 'next'

import { submitEnquiry } from '@/app/(frontend)/connect/actions'
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
        <EnquiryForm
          action={submitEnquiry.bind(null, 'welfare')}
          showSupportType
          submitLabel="Request Support"
        />
      </Container>
    </div>
  )
}
