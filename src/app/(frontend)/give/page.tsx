import type { Metadata } from 'next'
import { BookOpen, Building2, HandCoins, HeartHandshake } from 'lucide-react'
import Link from 'next/link'

import { getPageBySlug } from '@/lib/getPageBySlug'
import { getPayloadClient } from '@/lib/payload'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { CopyField } from '@/components/site/CopyField'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('give')
  return {
    title: page?.seo?.metaTitle || page?.title || 'Give',
    description:
      page?.seo?.metaDescription ||
      'Give your tithes and offerings to City of God Christian Centre — online, by bank transfer, or in person.',
  }
}

export default async function GivePage() {
  const payload = await getPayloadClient()
  const [page, giving] = await Promise.all([
    getPageBySlug('give'),
    payload.findGlobal({ slug: 'giving' }).catch(() => null),
  ])

  const bank = giving?.bankTransfer
  const hasBankDetails = Boolean(bank?.accountName && bank?.sortCode && bank?.accountNumber)
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY)
  const onlineUrl = giving?.onlineGiving?.url

  return (
    <div>
      <PageHeader
        eyebrow="Generosity"
        title={page?.title || 'Give'}
        description={
          page?.subtitle ||
          'Your generosity helps us reach our city, care for our community, and build a house of worship for the next generation.'
        }
      />
      <BlockRenderer layout={page?.layout} />

      <Container className="py-16">
        <Reveal className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Ways to Give</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-700">Choose What Works for You</h2>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bank transfer */}
          <Reveal className="rounded-2xl border border-border bg-surface p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-serif text-xl font-semibold text-brand-700">Bank Transfer</h3>
            {hasBankDetails ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Give directly by bank transfer or standing order — 100% goes straight to the church, with no
                  platform fees.
                </p>
                <div className="mt-5 space-y-2">
                  <CopyField label="Account Name" value={bank!.accountName!} />
                  {/* Side by side only where each box has room for its number; on a small phone they stack. */}
                  <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                    <CopyField label="Sort Code" value={bank!.sortCode!} />
                    <CopyField label="Account Number" value={bank!.accountNumber!} />
                  </div>
                </div>
                {bank?.referenceNote && <p className="mt-4 text-sm text-ink-muted">{bank.referenceNote}</p>}
              </>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Bank transfer details will appear here once added in the admin panel (Settings → Giving).
              </p>
            )}
          </Reveal>

          {/* Online / card giving */}
          <Reveal delay={0.1} className="rounded-2xl border border-border bg-surface p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-flame-500/10 text-flame-500">
              <HandCoins className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-serif text-xl font-semibold text-brand-700">
              {giving?.onlineGiving?.label || 'Give Online'}
            </h3>
            {stripeConfigured ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Give quickly and securely online by card, as a one-time gift or on a recurring schedule.
                </p>
                <Link
                  href="/give/donate"
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-300"
                >
                  Give Online
                </Link>
                <Link
                  href="/give/manage"
                  className="mt-3 block text-center text-sm font-semibold text-brand-600 hover:underline"
                >
                  Manage my recurring giving →
                </Link>
              </>
            ) : onlineUrl ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Give quickly and securely online by card, in one gift or on a recurring schedule.
                </p>
                <a
                  href={onlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-300"
                >
                  {giving?.onlineGiving?.label || 'Give Online'}
                </a>
              </>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Online card giving is coming soon. In the meantime, bank transfer is the quickest way to give.
              </p>
            )}
          </Reveal>

          {/* In person */}
          <Reveal delay={0.15} className="rounded-2xl border border-border bg-surface p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
              <HeartHandshake className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-serif text-xl font-semibold text-brand-700">In Person</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Give by cash or card at any Sunday service — an offering point is available at each of our locations.
            </p>
          </Reveal>

          {/* Bookstore */}
          <Reveal delay={0.2} className="rounded-2xl border border-border bg-surface p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-serif text-xl font-semibold text-brand-700">Bookstore</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Support the ministry by picking up a book or resource from our bookstore.
            </p>
            <Link
              href="/give/bookstore"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
            >
              Visit our bookstore →
            </Link>
          </Reveal>
        </div>

        {/* Gift Aid */}
        <Reveal delay={0.1} className="mt-12 rounded-3xl bg-brand-50 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">UK Taxpayers</p>
          <h3 className="mt-2 font-serif text-2xl font-semibold text-brand-700">Make Your Gift Go Further with Gift Aid</h3>
          <p className="mt-3 max-w-2xl text-ink-muted">
            If you&apos;re a UK taxpayer, Gift Aid lets us claim an extra 25p for every £1 you give — at no extra cost
            to you.{' '}
            {stripeConfigured
              ? 'Tick the Gift Aid box when you give online and we\'ll take care of the rest.'
              : 'Ask us for a Gift Aid declaration form to get started.'}
          </p>
          {giving?.charityNumber && (
            <p className="mt-4 text-sm font-medium text-ink-muted">Charity No. {giving.charityNumber}</p>
          )}
        </Reveal>
      </Container>
    </div>
  )
}
