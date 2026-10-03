import type { Metadata } from 'next'
import { Newspaper, Pin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { BrandPanel } from '@/components/ui/BrandVisuals'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'News & Announcements',
  description: 'The latest news and announcements from City of God Christian Centre.',
}

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

export default async function NewsPage() {
  const payload = await getPayloadClient()
  const posts = await payload.find({
    collection: 'news',
    where: { _status: { equals: 'published' } },
    sort: ['-pinned', '-publishedDate'],
    limit: 30,
    draft: false,
  })

  return (
    <div>
      <PageHeader
        eyebrow="What's Happening"
        title="News & Announcements"
        description="Updates from across our church family."
      />
      <Container className="py-16">
        {posts.docs.length > 0 ? (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.docs.map((post) => {
              const img = mediaUrl(post.image)
              return (
                <StaggerItem key={post.id} className="h-full">
                  <Link
                    href={`/news/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      {img ? (
                        <Image
                          src={img}
                          alt={post.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <BrandPanel className="absolute inset-0 flex items-center justify-center">
                          <Newspaper className="h-10 w-10 text-gold-300" aria-hidden="true" />
                        </BrandPanel>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-600">
                        {post.pinned && <Pin className="h-3.5 w-3.5" aria-label="Pinned" />}
                        {new Date(post.publishedDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="mt-1 font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                        {post.title}
                      </p>
                      {post.summary && <p className="mt-2 text-sm text-ink-muted">{post.summary}</p>}
                    </div>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        ) : (
          <p className="text-ink-muted">No announcements yet — check back soon.</p>
        )}
      </Container>
    </div>
  )
}
