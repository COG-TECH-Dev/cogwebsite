import Image from 'next/image'

import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

function toEmbedUrl(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

export async function MediaCategoryGrid({
  category,
  eyebrow,
  title,
  description,
}: {
  category: 'gallery' | 'cog-tv' | 'cog-grand-radio'
  eyebrow: string
  title: string
  description?: string
}) {
  const payload = await getPayloadClient()
  const items = await payload.find({
    collection: 'media-gallery-items',
    where: { category: { equals: category } },
    limit: 50,
    draft: false,
  })

  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Container className="py-16">
        {items.docs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.docs.map((item) => {
              const images = (item.images ?? []).filter((img): img is Exclude<typeof img, number> => typeof img === 'object')
              const firstImage = images[0] ? mediaUrl(images[0]) : null

              return (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                  {item.videoEmbedUrl ? (
                    <div className="aspect-video">
                      <iframe
                        src={toEmbedUrl(item.videoEmbedUrl)}
                        className="h-full w-full"
                        allowFullScreen
                        title={item.title}
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-4/3 bg-brand-50">
                      {firstImage && <Image src={firstImage} alt={item.title} fill className="object-cover" />}
                    </div>
                  )}
                  <p className="p-4 font-medium text-brand-700">{item.title}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-ink-muted">Content will appear here once added in the admin panel.</p>
        )}
      </Container>
    </div>
  )
}
