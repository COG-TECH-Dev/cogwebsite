import { PrayerRequestForm } from '@/components/site/PrayerRequestForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Prayer Request' }

export default function PrayerRequestPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Prayer Request"
        description="Our prayer team is here for you. Requests marked confidential are seen only by pastoral staff."
      />
      <Container className="max-w-xl py-16">
        <PrayerRequestForm />
      </Container>
    </div>
  )
}
