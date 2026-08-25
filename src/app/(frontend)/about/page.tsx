import type { Metadata } from 'next'

import { getPageBySlug } from '@/lib/getPageBySlug'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about')
  return { title: page?.seo?.metaTitle || page?.title || 'About' }
}

export default async function AboutPage() {
  const page = await getPageBySlug('about')

  if (!page) {
    return <PageHeader eyebrow="About Us" title="About City of God Christian Centre" />
  }

  return (
    <div>
      <PageHeader eyebrow="About Us" title={page.title} />
      <BlockRenderer layout={page.layout} />
    </div>
  )
}
