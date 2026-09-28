import { submitEnquiry } from '@/app/(frontend)/connect/actions'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Request a Reference Letter' }

export default function ReferenceLetterPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Request a Reference Letter"
        description="Need a character or membership reference letter from City of God Christian Centre? Fill out the form below and our team will process your request."
      />
      <Container className="max-w-xl py-16">
        <EnquiryForm
          action={submitEnquiry.bind(null, 'reference-letter')}
          showReferenceLetterFields
          submitLabel="Submit Request"
        />
      </Container>
    </div>
  )
}
