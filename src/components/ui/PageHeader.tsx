import type { ReactNode } from 'react'

import { Container } from './Container'

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden bg-linear-to-br from-brand-900 via-brand-700 to-brand-600 text-white">
      {/* Soft glows in the logo's own colours + a faint dot grid — pure CSS, no images to load */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-gold-500/30 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-flame-500/20 blur-3xl" />
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'linear-gradient(to bottom, black, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 90%)',
          }}
        />
      </div>

      <Container className="py-16 sm:py-20">
        {eyebrow && (
          <p className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">
            <span className="h-px w-8 bg-gold-300" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4 max-w-4xl text-balance font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/80">{description}</p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </Container>
    </section>
  )
}
