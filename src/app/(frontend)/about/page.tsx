import type { Metadata } from 'next'

import { getPageBySlug } from '@/lib/getPageBySlug'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { AboutSubNav } from '@/components/site/AboutSubNav'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about')
  // An explicit `description: undefined` would wipe the site-wide default, so only set it when there is one.
  return { title: page?.seo?.metaTitle || page?.title || 'About', ...(page?.seo?.metaDescription ? { description: page.seo.metaDescription } : {}) }
}

export default async function AboutPage() {
  const page = await getPageBySlug('about')

  return (
    <div>
      <PageHeader
        eyebrow="About Us"
        title={page?.title || 'About City of God Christian Centre'}
        description={page?.subtitle ?? undefined}
      >
        <AboutSubNav />
      </PageHeader>
      <BlockRenderer layout={page?.layout} />
    </div>
  )
}
