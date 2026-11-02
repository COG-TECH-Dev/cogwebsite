import type { Metadata } from 'next'
import { CalendarCheck, ExternalLink, MessageCircle } from 'lucide-react'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { CHURCH_APP_URL } from '@/lib/church'
import { GRACE_CHAT_URL } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Appointments',
  description: 'Book time with the pastoral team at City of God Christian Centre in the church app, with Grace AI on WhatsApp if you need help.',
}

/** Appointments are booked in the church's app; Grace AI on WhatsApp is there to help. */
export default function AppointmentsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Book an Appointment"
        description="Book time with a member of our pastoral team in the City of God app."
      />
      <Container className="max-w-3xl py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <section aria-labelledby="book-heading" className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
              <CalendarCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 id="book-heading" className="mt-5 font-serif text-2xl font-semibold text-brand-700">
              Book in the app
            </h2>
            <p className="mt-2 flex-1 text-ink-muted">Appointments with our pastoral team are booked in the City of God app.</p>
            <div className="mt-6">
              <a href={CHURCH_APP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary gap-2">
                Book an appointment
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only"> (opens the City of God app in a new tab)</span>
              </a>
            </div>
          </section>

          <section aria-labelledby="help-heading" className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 id="help-heading" className="mt-5 font-serif text-2xl font-semibold text-brand-700">
              Need help?
            </h2>
            <p className="mt-2 flex-1 text-ink-muted">Chat with Grace AI on WhatsApp if you have a question or are not sure how to book.</p>
            <div className="mt-6">
              {/* Darker than WhatsApp's #25D366, which gives white text only 2:1 contrast; this is 5.4:1. */}
              <a
                href={GRACE_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b7a4b] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#096a41]"
              >
                Chat with Grace AI
                <span className="sr-only"> on WhatsApp (opens in a new tab)</span>
              </a>
            </div>
          </section>
        </div>

        <p className="mt-10 text-center text-ink-muted">
          Prefer to speak to someone?{' '}
          <Link href="/connect/contact" className="font-semibold text-brand-600 hover:underline">
            Contact us
          </Link>{' '}
          and we will point you the right way.
        </p>
      </Container>
    </div>
  )
}
