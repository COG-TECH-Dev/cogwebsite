import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60

type Args = { params: Promise<{ slug: string }> }

function fileUrl(file: unknown): string | null {
  if (file && typeof file === 'object' && 'url' in file && typeof file.url === 'string') {
    return file.url
  }
  return null
}

async function getResource(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({ collection: 'resources', where: { slug: { equals: slug } }, limit: 1 })
  return result.docs[0] ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const resource = await getResource(slug)
  return { title: resource?.title }
}

export default async function ResourcePage({ params }: Args) {
  const { slug } = await params
  const resource = await getResource(slug)
  if (!resource) notFound()

  const file = fileUrl(resource.file)

  return (
    <div>
      <PageHeader eyebrow="Resources" title={resource.title} />
      <Container className="py-16">
        {resource.body && (
          <div className="prose prose-neutral max-w-3xl">
            <RichText data={resource.body} />
          </div>
        )}
        {file && (
          <div className="mt-8">
            <Button href={file}>Download</Button>
          </div>
        )}
      </Container>
    </div>
  )
}
