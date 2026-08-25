import { submitEnquiry } from '@/app/(frontend)/connect/actions'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Membership' }

export default function MembershipPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Become a Member"
        description="Take the next step in your journey with City of God Christian Centre."
      />
      <Container className="max-w-xl py-16">
        <EnquiryForm action={submitEnquiry.bind(null, 'membership')} submitLabel="Submit" />
      </Container>
    </div>
  )
}
