import { submitEnquiry } from '@/app/(frontend)/connect/actions'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Appointments' }

export default function AppointmentsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Book an Appointment"
        description="Request time with a member of our pastoral team."
      />
      <Container className="max-w-xl py-16">
        <EnquiryForm action={submitEnquiry.bind(null, 'appointment')} showPreferredDate submitLabel="Request Appointment" />
      </Container>
    </div>
  )
}
