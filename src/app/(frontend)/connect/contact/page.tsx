import { submitEnquiry } from '@/app/(frontend)/connect/actions'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Contact Us' }

export default function ContactPage() {
  return (
    <div>
      <PageHeader eyebrow="Connect" title="Contact Us" description="Send us a message and we'll get back to you." />
      <Container className="max-w-xl py-16">
        <EnquiryForm action={submitEnquiry.bind(null, 'contact')} submitLabel="Send Message" />
      </Container>
    </div>
  )
}
