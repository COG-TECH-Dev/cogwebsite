import type { Metadata } from 'next'
import Link from 'next/link'

import { CookiePreferencesButton } from '@/components/site/CookiePreferencesButton'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How City of God Christian Centre uses cookies and similar technologies on this website.',
}

const rows = [
  {
    name: 'Your cookie choice',
    purpose: 'Remembers whether you accepted or rejected optional cookies, so we do not ask on every visit.',
    kind: 'Essential',
    detail: 'Stored in your browser (local storage). Stays until you clear it or change your choice.',
  },
  {
    name: 'Staff sign-in',
    purpose: 'Keeps our team signed in to the website admin area. Never set for ordinary visitors.',
    kind: 'Essential',
    detail: 'Session cookie, cleared when staff sign out or the session expires.',
  },
  {
    name: 'Google Analytics (_ga, _ga_…)',
    purpose:
      'Helps us understand how the website is used — which pages are visited and on what kind of device — so we can improve it. We do not use it to identify you.',
    kind: 'Optional — only if you accept',
    detail: 'Set by Google. Lasts up to 2 years.',
  },
]

export default function CookiePolicyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        title="Cookie Policy"
        description="What cookies this website uses, why, and how you stay in control."
      />
      <Container className="max-w-3xl py-16">
        <div className="space-y-10 text-ink-muted">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-brand-700">What are cookies?</h2>
            <p className="mt-3">
              Cookies are small text files a website saves on your device. Some are needed for the website to work;
              others help us understand how it is used. Similar technologies (such as your browser&apos;s local
              storage) do the same job, and this policy covers them too.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-brand-700">What we use</h2>
            <div className="mt-4 space-y-4">
              {rows.map((row) => (
                <div key={row.name} className="rounded-2xl border border-border bg-surface p-5">
                  <p className="font-semibold text-brand-700">{row.name}</p>
                  <p className="mt-1 text-sm">{row.purpose}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gold-600">{row.kind}</p>
                  <p className="mt-1 text-xs">{row.detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Optional cookies are only set <strong>after</strong> you choose Accept on our cookie banner. If you
              choose Reject, no analytics cookies are set.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-brand-700">Other companies&apos; services</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Online giving</strong> is completed on a secure page run by Stripe, which may set its own
                cookies to prevent fraud. See{' '}
                <a
                  href="https://stripe.com/cookies-policy/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-600 underline"
                >
                  Stripe&apos;s cookie policy
                </a>
                .
              </li>
              <li>
                <strong>Videos and live streams</strong> are played through YouTube, which may set cookies when you
                press play. See{' '}
                <a
                  href="https://policies.google.com/technologies/cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-600 underline"
                >
                  Google&apos;s cookie information
                </a>
                .
              </li>
              <li>
                The <strong>WhatsApp chat button</strong> is simply a link. Nothing is set by us; WhatsApp&apos;s own
                policy applies once you open it.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-brand-700">Your choices</h2>
            <p className="mt-3">
              You can change your mind at any time using the button below, which clears your saved choice and asks
              again. You can also block or delete cookies in your browser settings — the website will still work,
              though some features may not.
            </p>
            <div className="mt-5">
              <CookiePreferencesButton />
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-brand-700">More information</h2>
            <p className="mt-3">
              How we handle personal information more generally is explained in our{' '}
              <Link href="/privacy-policy" className="font-medium text-brand-600 underline">
                Privacy Policy
              </Link>
              . Questions? Please{' '}
              <Link href="/connect/contact" className="font-medium text-brand-600 underline">
                contact us
              </Link>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}
