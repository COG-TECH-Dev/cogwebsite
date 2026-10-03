import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPageBySlug } from '@/lib/getPageBySlug'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { AboutSubNav } from '@/components/site/AboutSubNav'
import { DutyPastorCard } from '@/components/site/DutyPastorCard'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  return { title: page?.seo?.metaTitle || page?.title, description: page?.seo?.metaDescription ?? undefined }
}

export default async function AboutSubPage({ params }: Args) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) notFound()

  return (
    <div>
      <PageHeader eyebrow="About Us" title={page.title} description={page.subtitle ?? undefined}>
        <AboutSubNav />
      </PageHeader>
      {slug === 'leadership' && (
        <Container className="max-w-3xl pt-10">
          <DutyPastorCard />
        </Container>
      )}
      <BlockRenderer layout={page.layout} />
    </div>
  )
}
