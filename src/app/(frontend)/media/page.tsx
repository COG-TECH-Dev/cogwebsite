import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata = { title: 'Media' }

const sections = [
  { label: 'Sermons', href: '/media/sermons', description: 'Catch up on recent messages.' },
  { label: 'Gallery', href: '/media/gallery', description: 'Photos from church life.' },
  { label: 'COG TV', href: '/media/cog-tv', description: 'Watch our video content.' },
  { label: 'COG Grand Radio', href: '/media/cog-grand-radio', description: 'Listen live and on demand.' },
]

export default function MediaHubPage() {
  return (
    <div>
      <PageHeader eyebrow="Media" title="Watch, Listen, and Explore" />
      <Container className="py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
