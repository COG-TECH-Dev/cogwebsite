import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

// Closes each About page: someone who has just read what we believe can act on it straight away.
export function PlanYourVisitCta() {
  return (
    <section className="border-t border-border bg-brand-50">
      <Container className="max-w-3xl py-14 text-center sm:py-16">
        <h2 className="font-serif text-2xl font-semibold text-brand-700 sm:text-3xl">Like what you&apos;ve read?</h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-muted">
          We&apos;d love to meet you. See our service times, where to find us and where to park, and what to expect on
          your first Sunday.
        </p>
        <div className="mt-6">
          <Button href="/connect/new-here">Plan Your Visit</Button>
        </div>
      </Container>
    </section>
  )
}
