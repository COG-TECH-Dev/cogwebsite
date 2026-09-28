import { getPayloadClient } from '@/lib/payload'
import { ShareTestimonyForm } from '@/components/site/ShareTestimonyForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Share Your Testimony' }

export default async function ShareTestimonyPage() {
  const payload = await getPayloadClient()
  const ministries = await payload.find({ collection: 'ministries', limit: 100, sort: 'name' })

  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Share Your Testimony"
        description="Tell us what God has done in your life — your story could encourage someone else in our church family."
      />
      <Container className="max-w-xl py-16">
        <ShareTestimonyForm ministries={ministries.docs.map((m) => ({ id: m.id, name: m.name }))} />
      </Container>
    </div>
  )
}
