import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { Globe2, HandHeart, Heart, MapPin, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { MissionSignupForm } from '@/components/site/MissionSignupForm'
import { BrandPanel } from '@/components/ui/BrandVisuals'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Missions',
  description: 'Mission projects, field missionaries, prayer needs and ways to give or go.',
}

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

function giveHref(fund?: string | null) {
  return fund ? `/give/donate?fund=${encodeURIComponent(fund)}` : '/give/donate'
}

export default async function MissionsPage() {
  const payload = await getPayloadClient()
  const [projects, missionaries] = await Promise.all([
    payload.find({ collection: 'mission-projects', limit: 50, sort: 'title' }),
    payload.find({ collection: 'missionaries', where: { active: { equals: true } }, limit: 50, sort: 'name' }),
  ])

  const active = projects.docs.filter((p) => p.status !== 'completed')
  const completed = projects.docs.filter((p) => p.status === 'completed')

  return (
    <div>
      <PageHeader
        eyebrow="Reaching the World"
        title="Missions"
        description="Taking the gospel and the love of Christ to the nations — see what we're doing, pray with us, give, or come with us."
      />
      <Container className="py-16">
        {/* Active projects */}
        <Reveal className="mb-10">
          <h2 className="font-serif text-3xl font-semibold text-brand-700">Active Mission Projects</h2>
        </Reveal>
        {active.length > 0 ? (
          <div className="space-y-10">
            {active.map((project) => {
              const img = mediaUrl(project.image)
              const gallery = (project.gallery ?? [])
                .map((g) => mediaUrl(g.image))
                .filter((u): u is string => Boolean(u))
                .slice(0, 4)
              return (
                <Reveal key={project.id}>
                  <article className="grid gap-8 overflow-hidden rounded-3xl border border-border bg-surface shadow-sm lg:grid-cols-5">
                    <div className="relative min-h-64 lg:col-span-2">
                      {img ? (
                        <Image
                          src={img}
                          alt={project.title}
                          fill
                          sizes="(min-width: 1024px) 40vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <BrandPanel className="absolute inset-0 flex items-center justify-center">
                          <Globe2 className="h-14 w-14 text-gold-300" aria-hidden="true" />
                        </BrandPanel>
                      )}
                    </div>
                    <div className="p-6 sm:p-8 lg:col-span-3">
                      {project.location && (
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-600">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {project.location}
                        </p>
                      )}
                      <h3 className="mt-2 font-serif text-2xl font-semibold text-brand-700">{project.title}</h3>
                      {project.summary && <p className="mt-3 text-ink-muted">{project.summary}</p>}
                      {project.description && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-semibold text-brand-600">Read more</summary>
                          <div className="prose prose-neutral mt-3 max-w-none">
                            <RichText data={project.description} />
                          </div>
                        </details>
                      )}
                      {project.prayerNeeds && (
                        <div className="mt-5 rounded-2xl bg-brand-50 p-4">
                          <p className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                            <HandHeart className="h-4 w-4" aria-hidden="true" />
                            Pray for this project
                          </p>
                          <p className="mt-1 text-sm text-ink-muted">{project.prayerNeeds}</p>
                        </div>
                      )}
                      {gallery.length > 0 && (
                        <div className="mt-5 grid grid-cols-4 gap-2">
                          {gallery.map((url, i) => (
                            <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-6 flex flex-wrap items-center gap-4">
                        <Link
                          href={giveHref(project.givingFund)}
                          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-300"
                        >
                          <Heart className="h-4 w-4" aria-hidden="true" />
                          Give to this project
                        </Link>
                        {project.videoUrl && (
                          <a
                            href={project.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
                          >
                            <PlayCircle className="h-4 w-4" aria-hidden="true" />
                            Watch the video
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        ) : (
          <Reveal className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-ink-muted">Our mission projects will appear here soon.</p>
          </Reveal>
        )}

        {/* Field missionaries */}
        {missionaries.docs.length > 0 && (
          <div className="mt-20">
            <Reveal className="mb-10">
              <h2 className="font-serif text-3xl font-semibold text-brand-700">Our Missionaries</h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {missionaries.docs.map((m) => {
                const photo = mediaUrl(m.photo)
                return (
                  <Reveal key={m.id}>
                    <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-brand-100">
                          {photo ? (
                            <Image src={photo} alt={m.name} fill sizes="64px" className="object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center font-serif text-xl font-semibold text-brand-600">
                              {m.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-semibold text-brand-700">{m.name}</h3>
                          {m.location && <p className="text-sm text-ink-muted">{m.location}</p>}
                        </div>
                      </div>
                      {m.bio && <p className="mt-4 text-sm text-ink-muted">{m.bio}</p>}
                      {m.prayerNeeds && (
                        <p className="mt-3 text-sm text-ink-muted">
                          <span className="font-semibold text-brand-700">Pray: </span>
                          {m.prayerNeeds}
                        </p>
                      )}
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        )}

        {/* Past projects */}
        {completed.length > 0 && (
          <div className="mt-20">
            <Reveal className="mb-6">
              <h2 className="font-serif text-2xl font-semibold text-brand-700">Completed Projects</h2>
            </Reveal>
            <ul className="space-y-3">
              {completed.map((p) => (
                <li key={p.id} className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="font-semibold text-brand-700">{p.title}</h3>
                  {(p.location || p.summary) && (
                    <p className="mt-1 text-sm text-ink-muted">{[p.location, p.summary].filter(Boolean).join(' — ')}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sign-up */}
        <div id="join" className="mx-auto mt-20 max-w-xl scroll-mt-28">
          <Reveal>
            <h2 className="font-serif text-3xl font-semibold text-brand-700">Come With Us</h2>
            <p className="mt-2 mb-8 text-ink-muted">
              Interested in joining a mission trip or volunteering with our Missions team? Tell us a little about
              yourself and we&apos;ll get in touch.
            </p>
            <MissionSignupForm projects={active.map((p) => ({ id: p.id, title: p.title }))} />
          </Reveal>
        </div>
      </Container>
    </div>
  )
}
