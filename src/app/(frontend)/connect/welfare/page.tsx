import type { Metadata } from 'next'
import { Mail, Phone } from 'lucide-react'
import Link from 'next/link'

import { submitEnquiry } from '@/app/(frontend)/connect/actions'
import { HELPLINES } from '@/lib/helplines'
import { getPayloadClient } from '@/lib/payload'
import { safeWebUrl } from '@/lib/safeUrl'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Welfare & Support' }

// The kinds of help, in the order they are shown. The values match the form's "kind of support" choices.
const GROUPS = [
  { value: 'financial', label: 'Financial help' },
  { value: 'counselling', label: 'Counselling' },
  { value: 'food', label: 'Food and practical help' },
  { value: 'other', label: 'Other support' },
] as const

type Args = { searchParams: Promise<{ type?: string }> }

export default async function WelfarePage({ searchParams }: Args) {
  const { type } = await searchParams
  const defaultSupportType = GROUPS.find((g) => g.value === type)?.value
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  // Only services the church has entered are shown; with none, the whole section stays out of sight.
  const services = (settings?.welfareSupport?.services ?? []).filter((s) => s.name)
  const groups = GROUPS.map((g) => ({ ...g, items: services.filter((s) => s.type === g.value) })).filter((g) => g.items.length > 0)

  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Welfare & Support"
        description="If you're going through a difficult time, we're here to help — discreetly and without judgement."
      />
      <Container className="max-w-xl py-16">
        <p className="mb-8 text-ink-muted">
          Whether it&apos;s a financial hardship, a need for counselling, or practical help like food, let us
          know below. This isn&apos;t shared publicly — only our welfare team sees what you submit, and someone
          will follow up with you directly.
        </p>
        <section aria-labelledby="helplines-heading" className="mb-10 rounded-2xl border border-border bg-brand-50 p-6">
          <h2 id="helplines-heading" className="font-serif text-xl font-semibold text-brand-700">
            Need help right now?
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            These national services are free to call or text. They are not run by the church.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {HELPLINES.map((h) => (
              <li key={h.name} className="rounded-xl bg-surface p-4">
                <p className="text-sm font-semibold text-ink">{h.name}</p>
                <a href={h.href} className="mt-0.5 inline-block font-semibold text-brand-600 hover:underline">
                  {h.number}
                </a>
                <p className="mt-1 text-xs text-ink-muted">{h.about}</p>
              </li>
            ))}
          </ul>
        </section>

        {groups.length > 0 && (
          <section aria-labelledby="support-heading" className="mb-10">
            <h2 id="support-heading" className="font-serif text-xl font-semibold text-brand-700">
              Support available
            </h2>
            <p className="mt-1 text-sm text-ink-muted">Help the church offers. Asking is private, and there is no judgement.</p>
            {groups.map((group) => (
              <div key={group.value} className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-600">{group.label}</h3>
                <ul className="mt-3 space-y-4">
                  {group.items.map((s, i) => {
                    const link = safeWebUrl(s.link)
                    return (
                      <li key={s.id ?? `${group.value}-${i}`} className="rounded-2xl border border-border bg-surface p-5">
                        <h4 className="font-serif text-lg font-semibold text-brand-700">{s.name}</h4>
                        {s.description && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.description}</p>}
                        {(s.whoFor || s.howToAccess) && (
                          <dl className="mt-3 space-y-1.5 text-sm">
                            {s.whoFor && (
                              <div className="flex gap-2">
                                <dt className="shrink-0 font-semibold text-ink">Who it is for:</dt>
                                <dd className="text-ink-muted">{s.whoFor}</dd>
                              </div>
                            )}
                            {s.howToAccess && (
                              <div className="flex gap-2">
                                <dt className="shrink-0 font-semibold text-ink">How to get it:</dt>
                                <dd className="text-ink-muted">{s.howToAccess}</dd>
                              </div>
                            )}
                          </dl>
                        )}
                        {(s.phone || s.email || link) && (
                          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-medium">
                            {s.phone && (
                              <li className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                                <a href={`tel:${s.phone.replace(/\s+/g, '')}`} className="text-brand-600 hover:underline">
                                  {s.phone}
                                </a>
                              </li>
                            )}
                            {s.email && (
                              <li className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                                <a href={`mailto:${s.email}`} className="text-brand-600 hover:underline">
                                  {s.email}
                                </a>
                              </li>
                            )}
                            {link && (
                              <li>
                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                                  More information
                                  <span className="sr-only"> about {s.name} (opens in a new tab)</span>
                                </a>
                              </li>
                            )}
                          </ul>
                        )}
                        <Link
                          href={`/connect/welfare?type=${s.type}#request`}
                          className="mt-4 inline-flex items-center rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-600 hover:text-white"
                        >
                          Ask for this help
                          <span className="sr-only">: {s.name}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </section>
        )}

        <h2 id="request" className="mb-3 scroll-mt-28 font-serif text-xl font-semibold text-brand-700">
          Ask our welfare team for support
        </h2>
        <EnquiryForm
          action={submitEnquiry.bind(null, 'welfare')}
          showSupportType
          defaultSupportType={defaultSupportType}
          submitLabel="Request Support"
        />
      </Container>
    </div>
  )
}
