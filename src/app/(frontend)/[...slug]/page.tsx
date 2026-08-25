import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPageBySlug } from '@/lib/getPageBySlug'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

type Args = { params: Promise<{ slug: string[] }> }

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug.join('/'))
  return { title: page?.seo?.metaTitle || page?.title }
}

export default async function CatchAllPage({ params }: Args) {
  const { slug } = await params
  const page = await getPageBySlug(slug.join('/'))

  if (!page) notFound()

  return (
    <div>
      <PageHeader title={page.title} />
      <BlockRenderer layout={page.layout} />
    </div>
  )
}
