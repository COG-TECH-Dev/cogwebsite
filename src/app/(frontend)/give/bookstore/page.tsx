import Image from 'next/image'

import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60
export const metadata = { title: 'Bookstore' }

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

export default async function BookstorePage() {
  const payload = await getPayloadClient()
  const items = await payload.find({ collection: 'bookstore-items', limit: 100, sort: 'title' })

  return (
    <div>
      <PageHeader eyebrow="Give" title="Bookstore" description="Books and resources to support your walk of faith." />
      <Container className="py-16">
        {items.docs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.docs.map((item) => {
              const img = mediaUrl(item.coverImage)
              return (
                <a
                  key={item.id}
                  href={item.externalPurchaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-3/4 bg-brand-50">
                    {img && <Image src={img} alt={item.title} fill className="object-cover" />}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-brand-700 group-hover:text-brand-600">{item.title}</p>
                    {item.author && <p className="text-sm text-ink-muted">{item.author}</p>}
                    {item.priceDisplay && <p className="mt-1 text-sm font-semibold text-gold-600">{item.priceDisplay}</p>}
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          <p className="text-ink-muted">Bookstore items will appear here once added in the admin panel.</p>
        )}
      </Container>
    </div>
  )
}
