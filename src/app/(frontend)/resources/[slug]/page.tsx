import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { TYPE_ICONS, TYPE_LABELS } from '@/lib/resourceDisplay'
import { BlockIcon } from '@/components/blocks/BlockIcon'
import { BrandPanel } from '@/components/ui/BrandVisuals'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'

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

async function getNextStartHere(currentId: number) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'resources',
    where: { type: { equals: 'start-here' } },
    sort: 'createdAt',
    limit: 50,
    depth: 0,
  })
  const i = result.docs.findIndex((r) => r.id === currentId)
  return i >= 0 ? (result.docs[i + 1] ?? null) : null
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
  const isStartHere = resource.type === 'start-here'
  // The newcomer pieces are meant to be read in order, so offer the next one.
  const next = isStartHere ? await getNextStartHere(resource.id) : null

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

          {isStartHere && (
            <div className="mt-10 space-y-6">
              {next && (
                <Link
                  href={`/resources/${next.slug}`}
                  className="group block rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-gold-300"
                >
                  <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Next</p>
                  <p className="mt-1 font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                    {next.title} <span aria-hidden="true">→</span>
                  </p>
                </Link>
              )}
              <div className="rounded-3xl bg-brand-50 p-6 sm:p-8">
                <h2 className="font-serif text-xl font-semibold text-brand-700 sm:text-2xl">Ready for a next step?</h2>
                <p className="mt-2 text-ink-muted">
                  There is no pressure and nothing to sign up for. When you are ready, we would love to help.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button href="/connect/next-steps">Take a Step of Faith</Button>
                  <Button href="/connect/new-here" variant="secondary">
                    Plan Your Visit
                  </Button>
                </div>
                <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
                  <Link href="/connect/contact" className="text-brand-600 hover:underline">
                    Ask us a question →
                  </Link>
                  <Link href="/connect/prayer-request" className="text-brand-600 hover:underline">
                    Share a prayer request →
                  </Link>
                </p>
              </div>
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
            <h2 className="mb-8 font-serif text-2xl font-semibold text-brand-700">
              {isStartHere ? 'More to read' : `More ${TYPE_LABELS[resource.type] ?? resource.type}s`}
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/resources/${other.slug}`}
                  className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <BlockIcon name={icon} className="h-6 w-6 text-gold-600" />
                  <h3 className="mt-3 font-serif font-semibold text-brand-700 group-hover:text-brand-600">
                    {other.title}
                  </h3>
                </Link>
              ))}
            </div>
          </Container>
        </div>
      )}
    </div>
  )
}
