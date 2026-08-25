import type { Metadata } from 'next'
import Link from 'next/link'

import { getPageBySlug } from '@/lib/getPageBySlug'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('give')
  return { title: page?.seo?.metaTitle || page?.title || 'Give' }
}

export default async function GivePage() {
  const page = await getPageBySlug('give')

  return (
    <div>
      <PageHeader
        eyebrow="Generosity"
        title={page?.title || 'Give Online'}
        description="Content Editors: add giving details and your provider's embed link here via the Pages collection (slug: 'give')."
      />
      <BlockRenderer layout={page?.layout} />
      <div className="pb-16 text-center">
        <Link href="/give/bookstore" className="text-sm font-semibold text-brand-600 hover:underline">
          Visit our bookstore →
        </Link>
      </div>
    </div>
  )
}
