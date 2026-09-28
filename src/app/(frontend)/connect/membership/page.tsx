import { submitEnquiry } from '@/app/(frontend)/connect/actions'
import { getPayloadClient } from '@/lib/payload'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Membership' }

export default async function MembershipPage() {
  const payload = await getPayloadClient()
  const ministries = await payload.find({ collection: 'ministries', limit: 100, sort: 'name' })

  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Become a Member"
        description="Take the next step in your journey with City of God Christian Centre."
      />
      <Container className="max-w-xl py-16">
        <EnquiryForm
          action={submitEnquiry.bind(null, 'membership')}
          ministries={ministries.docs.map((m) => ({ id: m.id, name: m.name }))}
          submitLabel="Submit"
        />
      </Container>
    </div>
  )
}
