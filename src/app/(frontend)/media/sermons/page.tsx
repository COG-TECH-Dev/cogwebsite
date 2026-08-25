import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60
export const metadata = { title: 'Sermons' }

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

export default async function SermonsPage() {
  const payload = await getPayloadClient()
  const sermons = await payload.find({ collection: 'sermons', sort: '-date', limit: 50 })

  return (
    <div>
      <PageHeader eyebrow="Media" title="Sermons" description="Recent messages from City of God Christian Centre." />
      <Container className="py-16">
        {sermons.docs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sermons.docs.map((sermon) => {
              const img = mediaUrl(sermon.thumbnail)
              return (
                <Link
                  key={sermon.id}
                  href={`/media/sermons/${sermon.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-video bg-brand-100">
                    {img && <Image src={img} alt={sermon.title} fill className="object-cover" />}
                  </div>
                  <div className="p-5">
                    <p className="font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                      {sermon.title}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {[sermon.speaker, new Date(sermon.date).toLocaleDateString('en-GB')]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-ink-muted">Sermons will appear here once added in the admin panel.</p>
        )}
      </Container>
    </div>
  )
}
