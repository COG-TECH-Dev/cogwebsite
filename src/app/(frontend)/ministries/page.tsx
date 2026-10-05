import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { guessMinistryIcon } from '@/lib/guessMinistryIcon'
import { BlockIcon } from '@/components/blocks/BlockIcon'
import { ACCENTS, BrandPanel } from '@/components/ui/BrandVisuals'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60
export const metadata = { title: 'Ministries' }

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

type Args = { searchParams: Promise<{ q?: string }> }

export default async function MinistriesPage({ searchParams }: Args) {
  const { q } = await searchParams
  const query = (q ?? '').trim().slice(0, 80)
  const payload = await getPayloadClient()
  const all = await payload.find({ collection: 'ministries', limit: 100, sort: 'name' })
  // A short list, so match in memory on the name, the summary and the leader.
  const needle = query.toLowerCase()
  const ministries = {
    docs: needle
      ? all.docs.filter((m) => [m.name, m.summary, m.leaderName].some((v) => v?.toLowerCase().includes(needle)))
      : all.docs,
  }

  return (
    <div>
      <PageHeader
        eyebrow="Get Involved"
        title="Find Your Ministry"
        description="Every ministry is a place to belong, grow, and use your gifts to serve God and others. Find where you fit in."
      />
      <Container className="py-20">
        {all.docs.length > 0 && (
          <form
            action="/ministries"
            role="search"
            aria-label="Search ministries"
            className="mb-10 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-surface p-5"
          >
            <div className="min-w-[200px] flex-1">
              <label htmlFor="q" className="mb-1 block text-sm font-medium text-ink">
                Search ministries
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="e.g. youth, prayer, music"
                className="input"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Search
              </button>
              {query && (
                <Link
                  href="/ministries"
                  className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-brand-50"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        )}

        {ministries.docs.length > 0 ? (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ministries.docs.map((ministry, i) => {
              const img = mediaUrl(ministry.image)
              const accent = ACCENTS[i % ACCENTS.length]
              const icon = ministry.icon || guessMinistryIcon(ministry.name)
              return (
                <StaggerItem key={ministry.id} className="h-full">
                  <Link
                    href={`/ministries/${ministry.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-4/3 overflow-hidden">
                      {img ? (
                        <Image
                          src={img}
                          alt={ministry.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <BrandPanel className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                            <BlockIcon name={icon} className="h-8 w-8 text-gold-300" />
                          </span>
                        </BrandPanel>
                      )}
                      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${accent.bar}`} />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="font-serif text-xl font-semibold text-brand-700 group-hover:text-brand-600">
                        {ministry.name}
                      </h2>
                      {ministry.summary && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">{ministry.summary}</p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-600">
                        Learn more
                        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        ) : query ? (
          <p className="text-ink-muted">
            No ministries match &ldquo;{query}&rdquo;. Try a different word, or{' '}
            <Link href="/ministries" className="font-medium text-brand-600 underline hover:text-brand-700">
              see them all
            </Link>
            .
          </p>
        ) : (
          <p className="text-ink-muted">Ministries will appear here once added in the admin panel.</p>
        )}

        <Reveal className="mt-16 rounded-3xl bg-brand-50 p-8 text-center sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Not Sure Where to Start?</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-700 sm:text-3xl">
            We&apos;ll help you find your place
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-muted">
            Reach out and our team will help you discover the ministry that fits your gifts, interests and season of
            life.
          </p>
          <Link
            href="/connect/membership"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-300"
          >
            Get Connected
          </Link>
        </Reveal>
      </Container>
    </div>
  )
}
