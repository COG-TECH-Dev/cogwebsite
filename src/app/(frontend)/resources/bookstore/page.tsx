import { BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { BookOrderForm } from '@/components/site/BookOrderForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Bookstore' }

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

/**
 * The church's books. Nothing is paid for on the website: a visitor orders with the form below and collects the book at
 * church. A book that also has an online shop link in the admin keeps a "Buy online" link.
 */
export default async function BookstorePage({ searchParams }: { searchParams: Promise<{ book?: string }> }) {
  const { book } = await searchParams
  const payload = await getPayloadClient()
  const items = await payload.find({ collection: 'bookstore-items', limit: 100, sort: 'title' })
  const wanted = book && /^\d+$/.test(book) ? Number(book) : undefined
  const defaultBookId = items.docs.some((i) => i.id === wanted) ? wanted : undefined

  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="Bookstore"
        description="Books from City of God Christian Centre to support your walk of faith. Order one here and collect it at church."
      />
      <Container className="py-16">
        {items.docs.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.docs.map((item) => {
                const img = mediaUrl(item.coverImage)
                return (
                  <div key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="relative aspect-3/4 bg-brand-50">
                      {img ? (
                        <Image src={img} alt={`Cover of ${item.title}`} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-contain" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gold-600">
                          <BookOpen className="h-14 w-14" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="font-serif text-lg font-semibold text-brand-700">{item.title}</p>
                      {item.author && <p className="text-sm text-ink-muted">{item.author}</p>}
                      {item.description && <p className="mt-2 text-sm text-ink-muted">{item.description}</p>}
                      {item.priceDisplay && <p className="mt-2 text-lg font-semibold text-gold-600">{item.priceDisplay}</p>}
                      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                        <Link href={`/resources/bookstore?book=${item.id}#order`} className="btn-primary" scroll>
                          Order for collection
                        </Link>
                        {item.externalPurchaseLink && (
                          <a href={item.externalPurchaseLink} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-600 hover:underline">
                            Buy online <span aria-hidden="true">→</span>
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <section id="order" aria-labelledby="order-heading" className="mx-auto mt-16 max-w-xl scroll-mt-28">
              <h2 id="order-heading" className="font-serif text-2xl font-semibold text-brand-700 sm:text-3xl">
                Order a book
              </h2>
              <p className="mt-2 mb-8 text-ink-muted">
                Tell us which book you would like and collect it at church. There is nothing to pay on the website.
              </p>
              <BookOrderForm
                books={items.docs.map((i) => ({ id: i.id, title: i.title, price: i.priceDisplay ?? null }))}
                defaultBookId={defaultBookId}
              />
            </section>
          </>
        ) : (
          <p className="text-ink-muted">Books will appear here soon.</p>
        )}
      </Container>
    </div>
  )
}
