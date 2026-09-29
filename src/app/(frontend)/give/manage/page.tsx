import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { ManageGivingForm } from '@/components/site/ManageGivingForm'

export const metadata: Metadata = { title: 'Manage My Giving' }

export default function ManageGivingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Give"
        title="Manage My Recurring Giving"
        description="Update your payment method, change the amount, or cancel your recurring gift."
      />
      <Container className="max-w-md py-16">
        <ManageGivingForm />
      </Container>
    </div>
  )
}
