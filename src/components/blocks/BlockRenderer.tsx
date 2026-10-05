import { RichText } from '@payloadcms/richtext-lexical/react'
import { ArrowUpRight, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import type { Page, Testimonial } from '@/payload-types'
import { youtubeVideoId } from '@/lib/youtube'
import { YouTubePlayer } from '@/components/site/YouTubePlayer'
import { ACCENTS, BrandPanel, Glows } from '@/components/ui/BrandVisuals'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'
import { BlockIcon } from './BlockIcon'

type Layout = NonNullable<Page['layout']>
type LayoutBlock = Layout[number]

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

const paragraphs = (text: string | null | undefined) =>
  (text ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

const isExternal = (href: string) => /^https?:\/\//i.test(href)

const TITLE_WORDS = new Set(['apostle', 'pastor', 'rev', 'dr', 'prophet', 'bishop', 'elder', 'evangelist', 'minister', 'mr', 'mrs', 'ms'])

function initials(name: string) {
  const words = name.split(/\s+/).filter((w) => !TITLE_WORDS.has(w.toLowerCase().replace(/\./g, '')))
  const use = words.length > 0 ? words : name.split(/\s+/)
  return use
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function SectionHeading({
  eyebrow,
  heading,
  intro,
}: {
  eyebrow?: string | null
  heading?: string | null
  intro?: string | null
}) {
  if (!eyebrow && !heading && !intro) return null
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">{eyebrow}</p>
      )}
      {heading && (
        <h2 className="mt-3 text-balance font-serif text-3xl font-semibold text-brand-700 sm:text-4xl">{heading}</h2>
      )}
      {intro && <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-muted">{intro}</p>}
    </Reveal>
  )
}

function MemberVisual({ photo, name, large }: { photo: unknown; name: string; large?: boolean }) {
  const img = mediaUrl(photo)
  if (img) {
    return (
      <Image
        src={img}
        alt={name}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover object-top"
      />
    )
  }
  return (
    <BrandPanel className="absolute inset-0 flex items-center justify-center">
      <span
        className={`flex items-center justify-center rounded-full border border-gold-300/40 bg-white/10 font-serif font-semibold text-gold-300 backdrop-blur ${
          large ? 'h-36 w-36 text-6xl' : 'h-24 w-24 text-4xl'
        }`}
      >
        {initials(name)}
      </span>
    </BrandPanel>
  )
}

function Block({ block }: { block: LayoutBlock }) {
  switch (block.blockType) {
    case 'hero': {
      const img = mediaUrl(block.backgroundImage)
      return (
        <section className="relative overflow-hidden bg-brand-700 py-24 text-center text-white">
          {img && <Image src={img} alt="" fill sizes="100vw" className="absolute inset-0 object-cover opacity-30" />}
          <Container className="relative">
            <h2 className="font-serif text-4xl font-semibold">{block.headline}</h2>
            {block.subheadline && <p className="mx-auto mt-4 max-w-xl text-white/80">{block.subheadline}</p>}
            {block.ctaButtons && block.ctaButtons.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {block.ctaButtons.map((cta, i) => (
                  <Button key={i} href={cta.url}>
                    {cta.label}
                  </Button>
                ))}
              </div>
            )}
          </Container>
        </section>
      )
    }

    case 'richText':
      return (
        <Container className="py-16">
          <div className="prose prose-neutral max-w-3xl">
            <RichText data={block.content} />
          </div>
        </Container>
      )

    case 'splitFeature': {
      const img = mediaUrl(block.image)
      const imageLeft = block.imagePosition === 'left'
      const tinted = block.background === 'tinted'
      return (
        <section className={tinted ? 'bg-brand-50' : ''}>
          <Container className="grid items-center gap-14 py-20 lg:grid-cols-2 lg:gap-20">
            <Reveal className={imageLeft ? 'lg:order-2' : ''}>
              {block.eyebrow && (
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">{block.eyebrow}</p>
              )}
              <h2 className="mt-3 text-balance font-serif text-3xl font-semibold leading-tight text-brand-700 sm:text-4xl lg:text-5xl">
                {block.heading}
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-muted">
                {paragraphs(block.body).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {block.bullets && block.bullets.length > 0 && (
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {block.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 font-medium text-ink">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                      </span>
                      {b.text}
                    </li>
                  ))}
                </ul>
              )}
              {block.buttonLabel && block.buttonUrl && (
                <div className="mt-9">
                  <Button href={block.buttonUrl}>{block.buttonLabel}</Button>
                </div>
              )}
            </Reveal>

            <Reveal delay={0.15} className={imageLeft ? 'lg:order-1' : ''}>
              <div className="relative mx-auto w-full max-w-xl">
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 translate-x-4 translate-y-4 rounded-[2rem] border-2 border-gold-300"
                />
                <div className="relative aspect-4/3 overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-700/25">
                  {img ? (
                    <Image
                      src={img}
                      alt={block.heading}
                      fill
                      sizes="(min-width: 1024px) 40vw, 90vw"
                      className="object-cover"
                    />
                  ) : (
                    <BrandPanel className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src="/images/COG-logo.webp"
                        alt=""
                        width={1600}
                        height={900}
                        sizes="(min-width: 1024px) 30vw, 70vw"
                        className="h-auto w-3/4"
                      />
                    </BrandPanel>
                  )}
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      )
    }

    case 'imageGrid':
      return (
        <Container className="py-16">
          {block.heading && <h2 className="mb-8 font-serif text-2xl font-semibold text-brand-700">{block.heading}</h2>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {block.images?.map((item, i) => {
              const img = mediaUrl(item.image)
              return (
                <figure key={i} className="overflow-hidden rounded-xl border border-border">
                  <div className="relative aspect-4/3 bg-brand-50">
                    {img && (
                      <Image
                        src={img}
                        alt={item.caption || ''}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  {item.caption && <figcaption className="p-3 text-sm text-ink-muted">{item.caption}</figcaption>}
                </figure>
              )
            })}
          </div>
        </Container>
      )

    case 'cardGrid': {
      const colsClass =
        block.columns === '4'
          ? 'sm:grid-cols-2 lg:grid-cols-4'
          : block.columns === '3'
            ? 'sm:grid-cols-2 lg:grid-cols-3'
            : 'sm:grid-cols-2'
      return (
        <Container className="py-20">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} />
          <StaggerGroup className={`grid gap-6 ${colsClass}`}>
            {block.items?.map((item, i) => {
              const accent = ACCENTS[i % ACCENTS.length]
              const cardClass =
                'group relative block h-full overflow-hidden rounded-2xl border border-border bg-surface p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
              const content = (
                <>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${accent.bar}`}
                  />
                  <div className="flex items-start justify-between">
                    {item.icon ? (
                      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent.badge}`}>
                        <BlockIcon name={item.icon} className="h-6 w-6" />
                      </span>
                    ) : (
                      <span className={`font-serif text-3xl font-semibold ${accent.number}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    )}
                    {item.href && (
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-5 w-5 text-ink-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-600"
                      />
                    )}
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-semibold text-brand-700">{item.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">{item.body}</p>
                  {item.footnote && (
                    <p className="mt-4 border-t border-border pt-3 text-sm font-medium text-gold-600">{item.footnote}</p>
                  )}
                </>
              )
              return (
                <StaggerItem key={i} className="h-full">
                  {item.href ? (
                    isExternal(item.href) ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                        {content}
                      </a>
                    ) : (
                      <Link href={item.href} className={cardClass}>
                        {content}
                      </Link>
                    )
                  ) : (
                    <div className={cardClass}>{content}</div>
                  )}
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </Container>
      )
    }

    case 'timeline':
      return (
        <section className="bg-brand-50">
          <Container className="py-20">
            <SectionHeading eyebrow={block.eyebrow} heading={block.heading} />
            <ol className="relative mx-auto max-w-4xl">
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-4 top-2 w-0.5 -translate-x-1/2 bg-linear-to-b from-gold-300 via-gold-500 to-flame-500 md:left-1/2"
              />
              {block.items?.map((item, i) => {
                const right = i % 2 === 1
                return (
                  <li key={i} className="relative pb-12 pl-14 last:pb-0 md:grid md:grid-cols-2 md:gap-x-20 md:pl-0">
                    <span className="absolute left-4 top-1 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-gold-600 text-sm font-bold text-white ring-8 ring-brand-50 md:left-1/2">
                      {i + 1}
                    </span>
                    <Reveal className={right ? 'md:col-start-2' : 'md:col-start-1 md:text-right'}>
                      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">{item.label}</p>
                        <h3 className="mt-2 font-serif text-2xl font-semibold text-brand-700">{item.title}</h3>
                        {item.body && <p className="mt-3 leading-relaxed text-ink-muted">{item.body}</p>}
                      </div>
                    </Reveal>
                  </li>
                )
              })}
            </ol>
          </Container>
        </section>
      )

    case 'stats': {
      const count = block.items?.length ?? 0
      const lgCols =
        ['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4', 'lg:grid-cols-5', 'lg:grid-cols-6'][
          Math.min(count, 6)
        ] ?? 'lg:grid-cols-4'
      return (
        <section className="relative isolate overflow-hidden bg-linear-to-br from-brand-900 via-brand-700 to-brand-600 text-white">
          <Glows />
          <Container className="py-16">
            <StaggerGroup className={`grid grid-cols-2 gap-y-12 text-center ${lgCols}`}>
              {block.items?.map((item, i) => (
                <StaggerItem key={i} className="px-4 lg:border-l lg:border-white/15 lg:first:border-l-0">
                  <div className="font-serif text-5xl font-semibold text-gold-300 sm:text-6xl">{item.value}</div>
                  <p className="mt-2 text-sm font-medium uppercase tracking-[0.15em] text-white/75">{item.label}</p>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Container>
        </section>
      )
    }

    case 'teamGrid': {
      const members = block.members ?? []
      const spotlight = block.featureFirst ? members[0] : undefined
      const others = block.featureFirst ? members.slice(1) : members
      return (
        <Container className="py-20">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} />

          {spotlight && (
            <Reveal className="mb-10">
              <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-lg md:grid md:grid-cols-5">
                <div className="relative min-h-72 md:col-span-2">
                  <MemberVisual photo={spotlight.photo} name={spotlight.name} large />
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-12 md:col-span-3">
                  {spotlight.title && (
                    <p className="w-fit rounded-full bg-gold-100 px-4 py-1 text-sm font-semibold text-gold-600">
                      {spotlight.title}
                    </p>
                  )}
                  <h3 className="mt-4 font-serif text-3xl font-semibold text-brand-700 sm:text-4xl">{spotlight.name}</h3>
                  {spotlight.bio && (
                    <p className="mt-4 text-lg leading-relaxed text-ink-muted">{spotlight.bio}</p>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((member, i) => (
              <StaggerItem key={i} className="h-full">
                <div className="group h-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-4/3">
                    <MemberVisual photo={member.photo} name={member.name} />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-semibold text-brand-700">{member.name}</h3>
                    {member.title && <p className="mt-1 text-sm font-semibold text-gold-600">{member.title}</p>}
                    {member.bio && (
                      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted">{member.bio}</p>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      )
    }

    case 'callToAction':
      return (
        <Container className="py-16">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-brand-900 via-brand-700 to-brand-600 px-8 py-16 text-center text-white sm:px-16">
              <Glows />
              <h2 className="mx-auto max-w-2xl text-balance font-serif text-3xl font-semibold sm:text-4xl">
                {block.heading}
              </h2>
              {block.body && <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">{block.body}</p>}
              <div className="mt-8">
                <Button href={block.buttonUrl}>{block.buttonLabel}</Button>
              </div>
            </div>
          </Reveal>
        </Container>
      )

    case 'faqAccordion':
      return (
        <Container className="py-16">
          {block.heading && <h2 className="mb-8 font-serif text-2xl font-semibold text-brand-700">{block.heading}</h2>}
          <div className="divide-y divide-border rounded-2xl border border-border">
            {block.items?.map((item, i) => (
              <details key={i} className="group p-5">
                <summary className="cursor-pointer list-none font-semibold text-brand-700">{item.question}</summary>
                <p className="mt-2 text-sm text-ink-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      )

    case 'testimonialsBlock': {
      const testimonials = (block.testimonials ?? []).filter(
        (t): t is Testimonial => typeof t === 'object',
      )
      return (
        <Container className="py-16">
          {block.heading && <h2 className="mb-8 font-serif text-2xl font-semibold text-brand-700">{block.heading}</h2>}
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-ink-muted">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 font-semibold text-brand-700">{t.name}</footer>
              </blockquote>
            ))}
          </div>
        </Container>
      )
    }

    case 'embed':
      return (
        <Container className="py-16">
          {block.heading && <h2 className="mb-4 font-serif text-2xl font-semibold text-brand-700">{block.heading}</h2>}
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
            {youtubeVideoId(block.url) ? (
              <YouTubePlayer
                videoId={youtubeVideoId(block.url)!}
                title={block.heading || 'Video'}
                sizes="(min-width: 1280px) 1152px, 100vw"
              />
            ) : (
              <iframe src={block.url} className="h-full w-full" allowFullScreen loading="lazy" title={block.heading || 'Embed'} />
            )}
          </div>
        </Container>
      )

    default:
      return null
  }
}

export function BlockRenderer({ layout }: { layout: Layout | null | undefined }) {
  if (!layout || layout.length === 0) return null
  return (
    <>
      {layout.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </>
  )
}
