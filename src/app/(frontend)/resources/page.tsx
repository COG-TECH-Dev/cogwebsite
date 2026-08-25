import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60
export const metadata = { title: 'Resources' }

const TYPE_LABELS: Record<string, string> = {
  devotional: 'Devotional',
  'reading-plan': 'Bible Reading Plan',
  'topical-guide': 'Topical Guide',
}

export default async function ResourcesPage() {
  const payload = await getPayloadClient()
  const resources = await payload.find({ collection: 'resources', limit: 100, sort: 'title' })

  return (
    <div>
      <PageHeader
        eyebrow="Grow"
        title="Resources"
        description="Devotionals, Bible reading plans, and topical guides."
      />
      <Container className="py-16">
        {resources.docs.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {resources.docs.map((resource) => (
              <li key={resource.id}>
                <Link
                  href={`/resources/${resource.slug}`}
                  className="block rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                    {TYPE_LABELS[resource.type] ?? resource.type}
                  </p>
                  <p className="mt-1 font-semibold text-brand-700">{resource.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted">Resources will appear here once added in the admin panel.</p>
        )}
      </Container>
    </div>
  )
}
