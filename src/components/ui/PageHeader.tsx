import { Container } from './Container'

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="border-b border-border bg-brand-700 py-16 text-white">
      <Container>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">{eyebrow}</p>
        )}
        <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-white/80">{description}</p>}
      </Container>
    </section>
  )
}
