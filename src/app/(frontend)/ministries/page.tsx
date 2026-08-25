import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60
export const metadata = { title: 'Ministries' }

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

export default async function MinistriesPage() {
  const payload = await getPayloadClient()
  const ministries = await payload.find({ collection: 'ministries', limit: 100, sort: 'name' })

  return (
    <div>
      <PageHeader
        eyebrow="Get Involved"
        title="Our Ministries"
        description="Find a place to serve, grow, and connect."
      />
      <Container className="py-16">
        {ministries.docs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ministries.docs.map((ministry) => {
              const img = mediaUrl(ministry.image)
              return (
                <Link
                  key={ministry.id}
                  href={`/ministries/${ministry.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-4/3 bg-brand-50">
                    {img && <Image src={img} alt={ministry.name} fill className="object-cover" />}
                  </div>
                  <div className="p-5">
                    <p className="font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                      {ministry.name}
                    </p>
                    {ministry.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{ministry.summary}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-ink-muted">Ministries will appear here once added in the admin panel.</p>
        )}
      </Container>
    </div>
  )
}
