import { Download, Smartphone } from 'lucide-react'

import { RADIO_APP_STEPS, RADIO_APP_TAGLINE, RADIO_APP_VERSE } from '@/lib/radioApp'

/** "Get the COG Grand Radio app": what it is, a button to open it, and the four install steps. */
export function RadioAppGuide({ href }: { href: string }) {
  return (
    <section id="app" aria-labelledby="radio-app-heading" className="mb-12 scroll-mt-28 rounded-3xl border border-border bg-brand-50 p-6 sm:p-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-gold-300">
          <Smartphone className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 id="radio-app-heading" className="font-serif text-2xl font-semibold text-brand-700 sm:text-3xl">
          Get the COG Grand Radio app
        </h2>
      </div>
      <p className="mt-4 max-w-2xl text-ink-muted">{RADIO_APP_TAGLINE}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-300"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Get the app
        <span className="sr-only"> (opens in a new tab)</span>
      </a>

      <h3 className="mt-8 font-serif text-lg font-semibold text-brand-700">How to install it</h3>
      <ol className="mt-4 grid gap-4 sm:grid-cols-2">
        {RADIO_APP_STEPS.map((step, i) => (
          <li key={step.title} className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Step {i + 1}</p>
            <p className="mt-1 font-semibold text-brand-700">{step.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.body}</p>
          </li>
        ))}
      </ol>

      <figure className="mt-8">
        <blockquote className="font-serif text-lg italic text-brand-700">“{RADIO_APP_VERSE.text}”</blockquote>
        <figcaption className="mt-1 text-sm text-ink-muted">{RADIO_APP_VERSE.ref}</figcaption>
      </figure>
    </section>
  )
}
