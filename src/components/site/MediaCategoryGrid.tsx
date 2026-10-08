import { Radio } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { publishedOnly } from '@/lib/published'
import { RADIO_APP_URL } from '@/lib/radioApp'
import { safeWebUrl } from '@/lib/safeUrl'
import { youtubeVideoId } from '@/lib/youtube'
import { RadioAppGuide } from '@/components/site/RadioAppGuide'
import { YouTubePlayer } from '@/components/site/YouTubePlayer'
import { ACCENTS, BrandPanel } from '@/components/ui/BrandVisuals'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

export async function MediaCategoryGrid({
  category,
  eyebrow,
  title,
  description,
}: {
  category: 'gallery' | 'cog-grand-radio'
  eyebrow: string
  title: string
  description?: string
}) {
  const payload = await getPayloadClient()
  const [items, settings] = await Promise.all([
    payload.find({
      collection: 'media-gallery-items',
      where: { and: [{ category: { in: [category] } }, publishedOnly] },
      limit: 50,
      draft: false,
    }),
    category === 'cog-grand-radio' ? payload.findGlobal({ slug: 'settings' }).catch(() => null) : null,
  ])
  const radioUrl = settings?.socialLinks?.radioUrl

  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Container className="py-16">
        {category === 'cog-grand-radio' && radioUrl && (
          <BrandPanel className="mb-12 rounded-3xl p-8 text-center text-white sm:p-10">
            <Radio className="mx-auto h-9 w-9 text-gold-300" aria-hidden="true" />
            <h2 className="mt-3 font-serif text-xl font-semibold sm:text-2xl">Listen Live, 24/7</h2>
            <a
              href={radioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-300"
            >
              Listen Live
            </a>
          </BrandPanel>
        )}

        {category === 'cog-grand-radio' && (
          <RadioAppGuide href={safeWebUrl(settings?.socialLinks?.radioAppUrl) ?? RADIO_APP_URL} />
        )}

        {items.docs.length > 0 ? (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.docs.map((item, i) => {
              const images = (item.images ?? []).filter((img): img is Exclude<typeof img, number> => typeof img === 'object')
              const accent = ACCENTS[i % ACCENTS.length]
              const ministry = typeof item.relatedMinistry === 'object' ? item.relatedMinistry : null
              const event = typeof item.relatedEvent === 'object' ? item.relatedEvent : null

              return (
                <StaggerItem key={item.id} className="h-full">
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    {item.videoEmbedUrl ? (
                      <div className="relative aspect-video">
                        <span aria-hidden="true" className={`absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r ${accent.bar}`} />
                        {youtubeVideoId(item.videoEmbedUrl) ? (
                          <YouTubePlayer videoId={youtubeVideoId(item.videoEmbedUrl)!} title={item.title} />
                        ) : (
                          <iframe
                            src={item.videoEmbedUrl}
                            className="h-full w-full"
                            allowFullScreen
                            loading="lazy"
                            title={item.title}
                          />
                        )}
                      </div>
                    ) : images.length > 1 ? (
                      <div className="relative grid aspect-4/3 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden">
                        <span aria-hidden="true" className={`absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r ${accent.bar}`} />
                        {images.slice(0, 4).map((img, imgIdx) => {
                          const url = mediaUrl(img)
                          const isLast = imgIdx === 3 && images.length > 4
                          return (
                            <div key={imgIdx} className="relative bg-brand-50">
                              {url && <Image src={url} alt="" fill sizes="25vw" className="object-cover" />}
                              {isLast && (
                                <div className="absolute inset-0 flex items-center justify-center bg-brand-900/60 text-sm font-semibold text-white">
                                  +{images.length - 3}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : images[0] ? (
                      <div className="relative aspect-4/3">
                        <span aria-hidden="true" className={`absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r ${accent.bar}`} />
                        <Image src={mediaUrl(images[0])!} alt={item.title} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
                      </div>
                    ) : (
                      <BrandPanel className="relative aspect-4/3">
                        <span aria-hidden="true" className={`absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r ${accent.bar}`} />
                      </BrandPanel>
                    )}
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <p className="font-medium text-brand-700">{item.title}</p>
                      {(ministry || event) && (
                        <div className="mt-auto flex flex-wrap gap-2">
                          {ministry && (
                            <Link
                              href={`/ministries/${ministry.slug}`}
                              className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600 hover:bg-gold-200"
                            >
                              {ministry.name}
                            </Link>
                          )}
                          {event && (
                            <Link
                              href={`/programmes/${event.slug}`}
                              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100"
                            >
                              {event.title}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        ) : (
          <p className="text-ink-muted">Content will appear here soon.</p>
        )}
      </Container>
    </div>
  )
}
