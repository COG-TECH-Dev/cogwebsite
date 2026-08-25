import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPageBySlug } from '@/lib/getPageBySlug'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  return { title: page?.seo?.metaTitle || page?.title }
}

export default async function AboutSubPage({ params }: Args) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) notFound()

  return (
    <div>
      <PageHeader eyebrow="About Us" title={page.title} />
      <BlockRenderer layout={page.layout} />
    </div>
  )
}
