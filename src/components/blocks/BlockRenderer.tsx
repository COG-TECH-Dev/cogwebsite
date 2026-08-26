import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

import type { Page, Testimonial } from '@/payload-types'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

type Layout = NonNullable<Page['layout']>
type LayoutBlock = Layout[number]

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return image.url
  }
  return null
}

function Block({ block }: { block: LayoutBlock }) {
  switch (block.blockType) {
    case 'hero': {
      const img = mediaUrl(block.backgroundImage)
      return (
        <section className="relative overflow-hidden bg-brand-700 py-24 text-center text-white">
          {img && <Image src={img} alt="" fill className="absolute inset-0 object-cover opacity-30" />}
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
                    {img && <Image src={img} alt={item.caption || ''} fill className="object-cover" />}
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
        <Container className="py-16">
          {(block.eyebrow || block.heading) && (
            <div className="mb-10 text-center">
              {block.eyebrow && (
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">{block.eyebrow}</p>
              )}
              {block.heading && (
                <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-700">{block.heading}</h2>
              )}
            </div>
          )}
          <div className={`grid gap-6 ${colsClass}`}>
            {block.items?.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border-t-4 border-gold-500 bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="font-serif text-lg font-semibold text-brand-700">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      )
    }

    case 'stats':
      return (
        <Container className="py-16">
          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {block.items?.map((item, i) => (
              <div key={i}>
                <p className="font-serif text-4xl font-semibold text-brand-600">{item.value}</p>
                <p className="mt-1 text-sm text-ink-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </Container>
      )

    case 'teamGrid':
      return (
        <Container className="py-16">
          {block.heading && <h2 className="mb-8 font-serif text-2xl font-semibold text-brand-700">{block.heading}</h2>}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {block.members?.map((member, i) => {
              const img = mediaUrl(member.photo)
              return (
                <div key={i}>
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-50">
                    {img && <Image src={img} alt={member.name} fill className="object-cover" />}
                  </div>
                  <p className="mt-3 font-semibold text-brand-700">{member.name}</p>
                  {member.title && <p className="text-sm text-gold-600">{member.title}</p>}
                  {member.bio && <p className="mt-2 text-sm text-ink-muted">{member.bio}</p>}
                </div>
              )
            })}
          </div>
        </Container>
      )

    case 'callToAction':
      return (
        <section className="bg-brand-50 py-16 text-center">
          <Container>
            <h2 className="font-serif text-3xl font-semibold text-brand-700">{block.heading}</h2>
            {block.body && <p className="mx-auto mt-3 max-w-xl text-ink-muted">{block.body}</p>}
            <div className="mt-6">
              <Button href={block.buttonUrl}>{block.buttonLabel}</Button>
            </div>
          </Container>
        </section>
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
          <div className="aspect-video overflow-hidden rounded-2xl border border-border">
            <iframe src={block.url} className="h-full w-full" allowFullScreen title={block.heading || 'Embed'} />
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
