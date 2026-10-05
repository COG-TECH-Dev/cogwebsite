import { ExternalLink, Flame, GraduationCap } from 'lucide-react'
import Link from 'next/link'

import { YOUTH_CAMPUS, YOUTH_TAGLINE } from '@/lib/youthMinistry'
import { Container } from '@/components/ui/Container'

// The Ablaze Youth page has its own look: dark, warm and bold, in the flame and
// gold of the church's colours, instead of the calmer teal used on other ministries.
const DARK = 'bg-[#15100e]'

/** The community link is typed in the admin, so only ever link to a real web address. */
export function safeWebUrl(value?: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

export function YouthHeader({
  name,
  summary,
  joinHref,
  community,
}: {
  name: string
  summary?: string | null
  joinHref: string
  community?: { href: string; label: string } | null
}) {
  return (
    <section className={`relative isolate overflow-hidden ${DARK} text-white`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-16 h-80 w-80 rounded-full bg-flame-500/40 blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-gold-500/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 24px)' }}
        />
      </div>
      <Container className="py-12 sm:py-24">
        <p className="inline-flex items-center gap-2 rounded-full bg-flame-500 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-900">
          <Flame className="h-3.5 w-3.5" aria-hidden="true" />
          Youth ministry
        </p>
        <h1 className="mt-5 max-w-4xl text-balance font-sans text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
          {name}
        </h1>
        <p className="mt-4 max-w-3xl bg-linear-to-r from-flame-500 via-gold-500 to-gold-300 bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl">
          {YOUTH_TAGLINE}
        </p>
        {summary && <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/80 max-sm:hidden">{summary}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={joinHref}
            className="inline-flex items-center justify-center rounded-full bg-gold-300 px-6 py-3 text-sm font-bold text-brand-900 transition-colors hover:bg-white"
          >
            Join Ablaze
          </Link>
          {community && (
            <a
              href={community.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {community.label}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </Container>
    </section>
  )
}

export function YouthActivities({ activities }: { activities: { title: string; description?: string | null }[] }) {
  return (
    <section aria-labelledby={activities.length > 0 ? 'youth-do-heading' : undefined} className={`${DARK} text-white`}>
      <Container className="py-16">
        {activities.length > 0 && (
          <>
            <h2 id="youth-do-heading" className="font-sans text-3xl font-black uppercase tracking-tight sm:text-4xl">
              What we do
            </h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {activities.map((a, i) => (
                <li key={`${a.title}-${i}`} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6">
                  <span aria-hidden="true" className="font-sans text-5xl font-black text-gold-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 text-xl font-bold">{a.title}</h3>
                  {a.description && <p className="mt-2 text-sm leading-relaxed text-white/75">{a.description}</p>}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className={`${activities.length > 0 ? 'mt-10' : ''} flex flex-col gap-5 rounded-3xl bg-linear-to-br from-gold-300 to-flame-500 p-7 text-brand-900 sm:flex-row sm:items-center sm:p-9`}>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-900 text-gold-300">
            <GraduationCap className="h-7 w-7" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2 className="font-sans text-2xl font-black uppercase tracking-tight">{YOUTH_CAMPUS.title}</h2>
            <p className="mt-1.5 max-w-2xl text-sm font-medium leading-relaxed sm:text-base">{YOUTH_CAMPUS.body}</p>
          </div>
          <Link
            href="/connect/find-a-campus"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Moving to a new city?
          </Link>
        </div>
      </Container>
    </section>
  )
}
