import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Connect' }

const sections = [
  { label: 'Prayer Request', href: '/connect/prayer-request', description: "Share what's on your heart." },
  { label: 'Contact Us', href: '/connect/contact', description: 'General questions and enquiries.' },
  { label: 'Appointments', href: '/connect/appointments', description: 'Book time with our pastoral team.' },
  { label: 'Membership', href: '/connect/membership', description: 'Take the next step and join us.' },
]

export default function ConnectPage() {
  return (
    <div>
      <PageHeader eyebrow="Connect" title="We'd Love to Hear From You" />
      <Container className="py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-lg"
            >
              <p className="font-serif text-xl font-semibold text-brand-700">{section.label}</p>
              <p className="mt-2 text-sm text-ink-muted">{section.description}</p>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  )
}
