import type { Metadata } from 'next'
import { Baby, Check, GraduationCap, Heart, Home, Mail } from 'lucide-react'
import Link from 'next/link'
import type { ComponentType, ReactNode } from 'react'

import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Life Events',
  description:
    'Baby dedications, naming ceremonies, engagements and weddings, and letters for your child’s school: how to start each one with City of God Christian Centre.',
}

const DEFAULT_EMAIL = 'info@cityofgoduk.org'

type Card = {
  title: string
  icon: ComponentType<{ className?: string }>
  intro: string
  points: ReactNode[]
  action: { label: string; href: string; external?: boolean }
}

/**
 * The church's own guidance for four life events, in short form. The email address is the church's contact email from
 * Settings (so it always matches the footer); the subject lines are the ones the church office already looks for.
 */
export default async function LifeEventsPage() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const email = settings?.contactEmail?.trim() || DEFAULT_EMAIL
  const mail = (subject: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}`
  const addr = <strong className="font-semibold text-ink">{email}</strong>

  const cards: Card[] = [
    {
      title: 'Baby Dedication',
      icon: Baby,
      intro: 'Present your child to God before the church family.',
      points: [
        <>
          Email {addr} with the subject <strong className="font-semibold text-ink">“Baby Dedication”</strong> and the month you would like. Once approved, we will send you a form to complete.
        </>,
        'Dedications are on the last Sunday of the month. We need at least 10 days’ notice for that month.',
        'Prayerfully decide what you wish to offer to God, following the examples in the Bible.',
        'A reception is entirely optional. You are welcome to host a small gathering at home or elsewhere. To use our community hall, check availability and book early with Sister Victoria Membere.',
      ],
      action: { label: 'Email us about a dedication', href: mail('Baby Dedication'), external: true },
    },
    {
      title: 'Naming Ceremony',
      icon: Home,
      intro: 'Your child is formally named, welcomed into the church family and blessed by a pastor, who prays for God’s protection, love and guidance over their life.',
      points: [
        <>
          Email {addr} with the subject <strong className="font-semibold text-ink">“NAMING CEREMONY”</strong> and tell us: the date and start time you want, your contact details, your home group, and your home address and postcode.
        </>,
        'The church office will arrange for a pastor to visit your home.',
        'Please give the pastor the names you will call your child, and their meanings.',
      ],
      action: { label: 'Email us about a naming ceremony', href: mail('NAMING CEREMONY'), external: true },
    },
    {
      title: 'Getting Engaged or Married',
      icon: Heart,
      intro: 'Congratulations! We are delighted to be part of this moment in your lives.',
      points: [
        'Let our pastor know you are getting engaged or married.',
        'Talk to the pastor well in advance about your plans, and check availability if you would like to marry in our church.',
        'Pre-marital counselling takes place 3 to 6 months before the wedding, whether you marry in our church or elsewhere.',
      ],
      action: { label: 'Book an appointment with a pastor', href: '/connect/appointments' },
    },
    {
      title: 'Letter for School',
      icon: GraduationCap,
      intro: 'Applying to a faith school? You may be asked for a letter confirming that you attend church.',
      points: [
        'Use our Reference Letter form and choose “Letter for School”.',
        'You will need your child’s full name and date of birth, both parents’ full names, your home address and your home group.',
      ],
      action: { label: 'Request a letter for school', href: '/connect/reference-letter?type=school' },
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Life Events"
        description="Baby dedications, naming ceremonies, engagements and weddings, and letters for your child’s school. Here is how to start each one."
      />
      <Container className="py-16">
        <StaggerGroup className="grid gap-6 lg:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <StaggerItem key={card.title} className="h-full">
                <section aria-labelledby={`le-${card.title.replace(/\W+/g, '-').toLowerCase()}`} className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h2 id={`le-${card.title.replace(/\W+/g, '-').toLowerCase()}`} className="mt-5 font-serif text-2xl font-semibold text-brand-700">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-ink-muted">{card.intro}</p>
                  <ul className="mt-5 flex-1 space-y-3 text-sm leading-relaxed text-ink-muted">
                    {card.points.map((point, i) => (
                      <li key={i} className="flex gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    {card.action.external ? (
                      <a href={card.action.href} className="btn-primary inline-flex items-center gap-2">
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        {card.action.label}
                      </a>
                    ) : (
                      <Link href={card.action.href} className="btn-primary inline-flex items-center gap-2">
                        {card.action.label}
                      </Link>
                    )}
                  </div>
                </section>
              </StaggerItem>
            )
          })}
        </StaggerGroup>

        <p className="mx-auto mt-12 max-w-2xl text-center text-ink-muted">
          Not sure where to start? <Link href="/connect/contact" className="font-semibold text-brand-600 hover:underline">Contact us</Link> or{' '}
          <Link href="/connect/appointments" className="font-semibold text-brand-600 hover:underline">book time with a pastor</Link>, and we will point you the right way.
        </p>
      </Container>
    </div>
  )
}
