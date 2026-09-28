import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { BlockIcon } from '@/components/blocks/BlockIcon'
import { ACCENTS, BrandPanel } from '@/components/ui/BrandVisuals'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60
export const metadata = { title: 'Resources' }

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

type Args = { searchParams: Promise<{ type?: string }> }

export default async function ResourcesPage({ searchParams }: Args) {
  const { type } = await searchParams
  const payload = await getPayloadClient()
  const resources = await payload.find({
    collection: 'resources',
    where: type ? { type: { equals: type } } : {},
    limit: 100,
    sort: 'title',
  })

  const filters = [
    { label: 'All', value: undefined },
    { label: 'Start Here', value: 'start-here' },
    { label: 'Devotionals', value: 'devotional' },
    { label: 'Reading Plans', value: 'reading-plan' },
    { label: 'Topical Guides', value: 'topical-guide' },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Grow"
        title="Resources"
        description="Devotionals, Bible reading plans, and topical guides to help you grow in your walk with God."
      />
      <Container className="py-16">
        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.label}
              href={f.value ? `/resources?type=${f.value}` : '/resources'}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                type === f.value ? 'bg-gold-500 text-brand-700' : 'border border-border text-ink hover:bg-brand-50'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {resources.docs.length > 0 ? (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.docs.map((resource, i) => {
              const accent = ACCENTS[i % ACCENTS.length]
              const icon = TYPE_ICONS[resource.type] ?? 'book'
              const tags = (resource.tags ?? []).filter((t): t is { tag: string; id?: string | null } => Boolean(t?.tag))
              return (
                <StaggerItem key={resource.id} className="h-full">
                  <Link
                    href={`/resources/${resource.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${accent.bar}`} />
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent.badge}`}>
                      <BlockIcon name={icon} className="h-6 w-6" />
                    </span>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-gold-600">
                      {TYPE_LABELS[resource.type] ?? resource.type}
                    </p>
                    <p className="mt-1 font-serif text-lg font-semibold text-brand-700 group-hover:text-brand-600">
                      {resource.title}
                    </p>
                    {tags.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                        {tags.map((t, tagIdx) => (
                          <span
                            key={t.id ?? tagIdx}
                            className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600"
                          >
                            {t.tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        ) : (
          <p className="text-ink-muted">Resources will appear here once added in the admin panel.</p>
        )}

        <BrandPanel className="mt-16 rounded-3xl p-8 text-center text-white sm:p-12">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Need Something Specific?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80">
            If you&apos;re looking for a resource on a particular topic, reach out and we&apos;ll help you find it.
          </p>
          <Link
            href="/connect/contact"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-600"
          >
            Contact Us
          </Link>
        </BrandPanel>
      </Container>
    </div>
  )
}
