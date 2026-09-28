import { submitEnquiry } from '@/app/(frontend)/connect/actions'
import { getPayloadClient } from '@/lib/payload'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Membership' }

type Args = { searchParams: Promise<{ ministry?: string }> }

export default async function MembershipPage({ searchParams }: Args) {
  const { ministry } = await searchParams
  const payload = await getPayloadClient()
  const ministries = await payload.find({ collection: 'ministries', limit: 100, sort: 'name' })
  const defaultMinistryId = ministry ? Number(ministry) : undefined

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
          defaultMinistryId={Number.isFinite(defaultMinistryId) ? defaultMinistryId : undefined}
          submitLabel="Submit"
        />
      </Container>
    </div>
  )
}
