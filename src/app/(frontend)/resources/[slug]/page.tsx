import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { BlockIcon } from '@/components/blocks/BlockIcon'
import { BrandPanel } from '@/components/ui/BrandVisuals'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'

export const revalidate = 60

type Args = { params: Promise<{ slug: string }> }

const TYPE_LABELS: Record<string, string> = {
  'start-here': 'Start Here',
  devotional: 'Devotional',
  'reading-plan': 'Bible Reading Plan',
  'topical-guide': 'Topical Guide',
}

const TYPE_ICONS: Record<string, string> = {
  'start-here': 'compass',
  devotional: 'sun',
  'reading-plan': 'book',
  'topical-guide': 'lightbulb',
}

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

async function getOtherResources(excludeId: number, type: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'resources',
    where: { and: [{ id: { not_equals: excludeId } }, { type: { equals: type } }] },
    limit: 3,
    sort: 'title',
  })
  return result.docs
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
  const icon = TYPE_ICONS[resource.type] ?? 'book'
  const tags = (resource.tags ?? []).filter((t): t is { tag: string; id?: string | null } => Boolean(t?.tag))
  const others = await getOtherResources(resource.id, resource.type)

  return (
    <div>
      <PageHeader
        eyebrow={TYPE_LABELS[resource.type] ?? resource.type}
        title={resource.title}
      />
      <Container className="py-16">
        <Reveal className="mx-auto max-w-3xl">
          <BrandPanel className="mb-8 flex h-32 items-center justify-center rounded-2xl">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <BlockIcon name={icon} className="h-8 w-8 text-gold-300" />
            </span>
          </BrandPanel>

          {resource.body && (
            <div className="prose prose-neutral max-w-none">
              <RichText data={resource.body} />
            </div>
          )}

          {file && (
            <div className="mt-8">
              <Button href={file}>Download</Button>
            </div>
          )}

          {tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
              {tags.map((t, i) => (
                <span
                  key={t.id ?? i}
                  className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600"
                >
                  {t.tag}
                </span>
              ))}
            </div>
          )}
        </Reveal>
      </Container>

      {others.length > 0 && (
        <div className="border-t border-border bg-brand-50">
          <Container className="py-16">
            <h2 className="mb-8 font-serif text-2xl font-semibold text-brand-700">More {TYPE_LABELS[resource.type] ?? resource.type}s</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/resources/${other.slug}`}
                  className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <BlockIcon name={icon} className="h-6 w-6 text-gold-600" />
                  <p className="mt-3 font-serif font-semibold text-brand-700 group-hover:text-brand-600">
                    {other.title}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </div>
      )}
    </div>
  )
}
