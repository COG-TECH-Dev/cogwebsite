import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { SafeguardingConcernForm } from '@/components/site/SafeguardingConcernForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Safeguarding',
  description:
    'How City of God Christian Centre keeps children safe, who to talk to, and how to raise a concern.',
}

const COMMITMENTS: { title: string; body: string }[] = [
  {
    title: 'We follow the law and national guidance.',
    body: 'This includes the Children Acts 1989 and 2004, the Safeguarding Vulnerable Groups Act 2006, the government guidance Working Together to Safeguard Children, and the Charity Commission’s safeguarding guidance for charities and trustees. A child is anyone under 18.',
  },
  {
    title: 'We recruit carefully.',
    body: 'Anyone who leads, teaches or cares for children is asked for references and an Enhanced DBS check (with a check of the children’s barred list where the law allows), and we talk with them about our standards before they start.',
  },
  {
    title: 'Children are never alone with one adult.',
    body: 'At least two unrelated adults are present at every children’s activity, and no adult is alone with a child out of sight of others.',
  },
  {
    title: 'Our children’s team is trained.',
    body: 'Everyone working with children has safeguarding training, has read this policy and follows our code of conduct. Training is refreshed regularly.',
  },
  {
    title: 'Parents and carers are in the picture.',
    body: 'Children are registered by a parent or carer, who gives written consent, tells us about medical needs and says who may collect them. We only take or share photos with consent.',
  },
  {
    title: 'We have clear responsibility.',
    body: 'We have a named Safeguarding Lead and a deputy, the trustees are responsible for safeguarding, and we review this policy at least once a year.',
  },
  {
    title: 'We listen, and we act.',
    body: 'We take every concern seriously. We never promise to keep a secret, and we never carry out an investigation ourselves: concerns go to the people with the legal duty to look into them.',
  },
]

const IF_A_CHILD_TELLS_YOU = [
  'Stay calm and listen. Let them speak in their own words and at their own pace.',
  'Reassure them they were right to tell you. Do not promise to keep it secret; explain that you may need to tell someone whose job is to keep children safe.',
  'Do not ask leading questions or press for details, and do not confront the person they are talking about.',
  'Write down what the child said, as close to their own words as you can, with the date and time, as soon as you can.',
  'Pass it on the same day, using the form below or by speaking to the Safeguarding Lead. If a child is in immediate danger, call 999.',
]

export default async function SafeguardingPage() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const sg = settings?.safeguarding
  // Stays off until the church has reviewed the page and named a Safeguarding Lead (Settings > Safeguarding).
  if (!sg?.enabled) notFound()

  const churchPhone = settings?.contactPhone
  const churchEmail = settings?.contactEmail

  return (
    <div>
      <PageHeader
        eyebrow="Keeping everyone safe"
        title="Safeguarding"
        description="Every child and young person who comes to City of God Christian Centre has the right to be safe. This page explains how we protect them, who to talk to, and how to raise a concern."
      />
      <Container className="max-w-3xl space-y-14 py-16">
        <div role="note" className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-900">
          <h2 className="font-serif text-xl font-semibold">If a child is in immediate danger, call 999.</h2>
          <p className="mt-2">
            If you are worried about a child but they are not in immediate danger, tell us using the{' '}
            <a href="#report" className="font-semibold underline">
              form below
            </a>{' '}
            or speak to our Safeguarding Lead.
          </p>
        </div>

        <section aria-labelledby="who">
          <h2 id="who" className="font-serif text-2xl font-semibold text-brand-700">
            Who to talk to
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-serif text-lg font-semibold text-brand-700">At the church</h3>
              <dl className="mt-3 space-y-3 text-sm">
                {(sg.leadName || sg.leadPhone || sg.leadEmail) && (
                  <div>
                    <dt className="font-semibold text-ink">Safeguarding Lead{sg.leadName ? `: ${sg.leadName}` : ''}</dt>
                    <dd className="text-ink-muted">
                      {sg.leadPhone && (
                        <a href={`tel:${sg.leadPhone.replace(/\s+/g, '')}`} className="font-medium text-brand-600 hover:underline">
                          {sg.leadPhone}
                        </a>
                      )}
                      {sg.leadPhone && sg.leadEmail && <br />}
                      {sg.leadEmail && (
                        <a href={`mailto:${sg.leadEmail}`} className="font-medium text-brand-600 hover:underline">
                          {sg.leadEmail}
                        </a>
                      )}
                    </dd>
                  </div>
                )}
                {(sg.deputyName || sg.deputyPhone) && (
                  <div>
                    <dt className="font-semibold text-ink">Deputy Safeguarding Lead{sg.deputyName ? `: ${sg.deputyName}` : ''}</dt>
                    <dd className="text-ink-muted">
                      {sg.deputyPhone && (
                        <a href={`tel:${sg.deputyPhone.replace(/\s+/g, '')}`} className="font-medium text-brand-600 hover:underline">
                          {sg.deputyPhone}
                        </a>
                      )}
                    </dd>
                  </div>
                )}
                {!sg.leadName && !sg.leadPhone && !sg.leadEmail && (churchPhone || churchEmail) && (
                  <div>
                    <dt className="font-semibold text-ink">Church office</dt>
                    <dd className="text-ink-muted">{[churchPhone, churchEmail].filter(Boolean).join(' · ')}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-serif text-lg font-semibold text-brand-700">Outside the church</h3>
              <ul className="mt-3 space-y-3 text-sm text-ink-muted">
                <li>
                  <strong className="text-ink">NSPCC Helpline</strong>, for adults worried about a child:{' '}
                  <a href="tel:08088005000" className="font-medium text-brand-600 hover:underline">
                    0808 800 5000
                  </a>{' '}
                  or{' '}
                  <a href="mailto:help@nspcc.org.uk" className="font-medium text-brand-600 hover:underline">
                    help@nspcc.org.uk
                  </a>
                </li>
                <li>
                  <strong className="text-ink">Childline</strong>, for children and young people:{' '}
                  <a href="tel:08001111" className="font-medium text-brand-600 hover:underline">
                    0800 1111
                  </a>{' '}
                  (free and confidential)
                </li>
                <li>
                  <strong className="text-ink">Police:</strong> 999 in an emergency, 101 if it is not an emergency
                </li>
                <li>
                  <a
                    href="https://www.gov.uk/report-child-abuse-to-local-council"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-600 hover:underline"
                  >
                    Report a concern to your local council&apos;s children&apos;s services →
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="commitments">
          <h2 id="commitments" className="font-serif text-2xl font-semibold text-brand-700">
            How we keep children safe
          </h2>
          <ul className="mt-6 space-y-5">
            {COMMITMENTS.map((c) => (
              <li key={c.title} className="text-ink-muted">
                <strong className="block font-semibold text-ink">{c.title}</strong>
                {c.body}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tells-you">
          <h2 id="tells-you" className="font-serif text-2xl font-semibold text-brand-700">
            If a child tells you something
          </h2>
          <ol className="mt-6 list-decimal space-y-3 pl-6 text-ink-muted marker:font-semibold marker:text-brand-600">
            {IF_A_CHILD_TELLS_YOU.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section id="report" aria-labelledby="report-heading" className="scroll-mt-24">
          <h2 id="report-heading" className="font-serif text-2xl font-semibold text-brand-700">
            Raise a concern
          </h2>
          <p className="mb-6 mt-3 text-ink-muted">
            Anyone can use this form: a parent, a leader, a member of the congregation, or a young person. It goes only to
            our Safeguarding Lead. You do not have to give your name.
          </p>
          <SafeguardingConcernForm />
        </section>

        <section aria-labelledby="next">
          <h2 id="next" className="font-serif text-2xl font-semibold text-brand-700">
            What happens next
          </h2>
          <p className="mt-3 text-ink-muted">
            Our Safeguarding Lead reads every concern as soon as possible and decides what needs to happen. Where a child
            may be at risk of harm, that means passing it to children&apos;s social care, the police or another agency
            straight away. We do not investigate ourselves, and we do not tell the person concerned before we have taken
            advice. If you gave us your details and asked us to, we will contact you.
          </p>
        </section>

        <section aria-labelledby="staff">
          <h2 id="staff" className="font-serif text-2xl font-semibold text-brand-700">
            A concern about someone who works or volunteers with us
          </h2>
          <p className="mt-3 text-ink-muted">
            Tick the box on the form, or contact the Safeguarding Lead. Concerns about a person in a position of trust are
            reported to the Local Authority Designated Officer (LADO). If your concern is about the Safeguarding Lead, speak
            to the deputy or one of our trustees, or call the NSPCC Helpline on 0808 800 5000.
          </p>
        </section>

        <section aria-labelledby="parents">
          <h2 id="parents" className="font-serif text-2xl font-semibold text-brand-700">
            Parents and carers
          </h2>
          <p className="mt-3 text-ink-muted">
            To register your child, give photo consent or offer to volunteer with our children&apos;s team, use the forms on
            the{' '}
            <Link href="/ministries/childrens-ministry" className="font-medium text-brand-600 underline hover:text-brand-700">
              Children&apos;s Ministry page
            </Link>
            .
          </p>
        </section>

        <p className="border-t border-border pt-6 text-sm text-ink-muted">
          We review this policy at least once a year{sg.reviewedOn ? `. Last reviewed: ${sg.reviewedOn}` : ''}. To ask for a
          copy of the full policy, contact the church office.
        </p>
      </Container>
    </div>
  )
}
