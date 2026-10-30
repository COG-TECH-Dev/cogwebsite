import { submitEnquiry } from '@/app/(frontend)/connect/actions'
import { getPayloadClient } from '@/lib/payload'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Request a Reference Letter' }

export default async function ReferenceLetterPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams
  const payload = await getPayloadClient()
  const groups = (await payload.find({ collection: 'homegroups', limit: 100, sort: 'area', depth: 0 }).catch(() => null))?.docs ?? []
  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Request a Reference Letter"
        description="Need a character or membership reference, or a letter for your child's school, from City of God Christian Centre? Fill out the form below and our team will process your request."
      />
      <Container className="max-w-xl py-16">
        <EnquiryForm
          action={submitEnquiry.bind(null, 'reference-letter')}
          showReferenceLetterFields
          defaultLetterType={type === 'school' ? 'school' : undefined}
          homegroups={groups.map((g) => g.area)}
          submitLabel="Submit Request"
        />
      </Container>
    </div>
  )
}
