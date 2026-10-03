import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

type Args = { params: Promise<{ slug: string }> }

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

async function getPost(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
    draft: false,
  })
  return result.docs[0] ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  const img = mediaUrl(post.image)
  return {
    title: post.title,
    description: post.summary ?? undefined,
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      type: 'article',
      ...(img ? { images: [img] } : {}),
    },
  }
}

export default async function NewsPostPage({ params }: Args) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const img = mediaUrl(post.image)
  const date = new Date(post.publishedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <PageHeader eyebrow={date} title={post.title} description={post.summary ?? undefined} />
      <Container className="max-w-3xl py-16">
        {img && (
          <div className="relative mb-10 aspect-video overflow-hidden rounded-2xl shadow-lg">
            <Image src={img} alt={post.title} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        )}
        {post.body && (
          <div className="prose prose-neutral max-w-none">
            <RichText data={post.body} />
          </div>
        )}
        <Link href="/news" className="mt-12 inline-block text-sm font-semibold text-brand-600 hover:underline">
          ← All news & announcements
        </Link>
      </Container>
    </div>
  )
}
