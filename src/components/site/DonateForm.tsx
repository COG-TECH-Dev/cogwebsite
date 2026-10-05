'use client'

import { Lock } from 'lucide-react'
import { useActionState, useState, startTransition, type FormEvent } from 'react'

import { createDonationCheckout, type DonateState } from '@/app/(frontend)/give/donate/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: DonateState = { status: 'idle' }
const QUICK_AMOUNTS = [10, 25, 50, 100]

export function DonateForm({
  branches,
  funds,
  defaultFund,
}: {
  branches: string[]
  funds: { name: string; description?: string }[]
  defaultFund?: string
}) {
  const [state, formAction, pending] = useActionState(createDonationCheckout, initialState)
  const [amount, setAmount] = useState<number | null>(25)
  const [customAmount, setCustomAmount] = useState('')
  const [giftAid, setGiftAid] = useState(false)
  const [frequency, setFrequency] = useState<'one-time' | 'weekly' | 'monthly'>('one-time')
  // Set when "On a date I choose" is picked: the earliest and latest start dates (the server checks them again).
  const [startRange, setStartRange] = useState<{ min: string; max: string } | null>(null)
  const startLater = startRange !== null

  // Sending the data ourselves keeps what was typed if the server sends back a message
  // (for example about the start date), instead of clearing the form.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(() => formAction(data))
  }

  const dayFromNow = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Honeypot />

      {branches.length > 0 && (
        <div>
          <label htmlFor="branch" className="mb-1 block text-sm font-medium text-ink">
            Which branch would you like to give to?
          </label>
          <select id="branch" name="branch" required className="input" defaultValue={branches[0]}>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <p className="mb-2 block text-sm font-medium text-ink">Amount</p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setAmount(value)
                setCustomAmount('')
              }}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                amount === value
                  ? 'border-gold-500 bg-gold-100 text-brand-700'
                  : 'border-border text-ink hover:bg-brand-50'
              }`}
            >
              £{value}
            </button>
          ))}
        </div>
        <div className="mt-2">
          <label htmlFor="customAmount" className="sr-only">
            Custom amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted">£</span>
            <input
              id="customAmount"
              type="number"
              min={1}
              step="0.01"
              placeholder="Other amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setAmount(null)
              }}
              className="input pl-7"
            />
          </div>
        </div>
        <input type="hidden" name="amount" value={customAmount || amount || ''} />
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-ink">Frequency</legend>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ['one-time', 'One-Time'],
              ['weekly', 'Weekly'],
              ['monthly', 'Monthly'],
            ] as const
          ).map(([freq, text]) => (
            <label
              key={freq}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 text-sm font-medium text-ink has-checked:border-gold-500 has-checked:bg-gold-100 has-checked:text-brand-700 has-focus-visible:ring-2 has-focus-visible:ring-gold-500"
            >
              <input
                type="radio"
                name="frequency"
                value={freq}
                checked={frequency === freq}
                onChange={() => setFrequency(freq)}
                className="sr-only"
              />
              {text}
            </label>
          ))}
        </div>

        {frequency !== 'one-time' && (
          <div className="mt-4 rounded-xl border border-border bg-brand-50 p-4">
            <p className="text-sm font-medium text-ink">When should your {frequency} gift start?</p>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="startChoice"
                  value="now"
                  checked={!startLater}
                  onChange={() => setStartRange(null)}
                  className="h-4 w-4 accent-brand-600"
                />
                Today
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="startChoice"
                  value="later"
                  checked={startLater}
                  onChange={() => setStartRange({ min: dayFromNow(3), max: dayFromNow(365) })}
                  className="h-4 w-4 accent-brand-600"
                />
                On a date I choose
              </label>
            </div>
            {startRange && (
              <div className="mt-3">
                <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-ink">
                  First gift on
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  min={startRange.min}
                  max={startRange.max}
                  className="input sm:max-w-56"
                />
                <p className="mt-1 text-xs text-ink-muted">
                  Your card is not charged until this day. It then repeats every {frequency === 'weekly' ? 'week' : 'month'} on the same
                  {frequency === 'weekly' ? ' day' : ' date'}. Choose a date at least 3 days away.
                </p>
              </div>
            )}
          </div>
        )}
      </fieldset>

      {funds.length > 0 && (
        <div>
          <label htmlFor="fund" className="mb-1 block text-sm font-medium text-ink">
            Fund
          </label>
          <select
            id="fund"
            name="fund"
            className="input"
            defaultValue={funds.some((f) => f.name === defaultFund) ? defaultFund : funds[0]?.name}
          >
            {funds.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
            Name
          </label>
          <input id="name" name="name" type="text" required className="input" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-brand-50 p-5">
        <label className="flex items-start gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            name="giftAidDeclared"
            checked={giftAid}
            onChange={(e) => setGiftAid(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
          />
          Yes, I want to Gift Aid this donation and any donations I make in the future or have made in the
          past 4 years, to City of God Christian Centre.
        </label>
        <p className="mt-2 text-xs text-ink-muted">
          I am a UK taxpayer and understand that if I pay less Income Tax/Capital Gains Tax in the current tax
          year than the amount of Gift Aid claimed on all my donations, it is my responsibility to pay any
          difference.
        </p>
        {giftAid && (
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="giftAidAddress" className="mb-1 block text-sm font-medium text-ink">
                Home Address
              </label>
              <textarea id="giftAidAddress" name="giftAidAddress" rows={2} required className="input" />
            </div>
            <div>
              <label htmlFor="giftAidPostcode" className="mb-1 block text-sm font-medium text-ink">
                Postcode
              </label>
              <input id="giftAidPostcode" name="giftAidPostcode" type="text" required className="input" />
            </div>
          </div>
        )}
      </div>

      <ConsentNotice />

      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Redirecting to secure checkout…' : 'Continue to Payment'}
      </button>
      <p className="flex items-start justify-center gap-1.5 text-center text-xs text-ink-muted">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Secure payment by Stripe. You&apos;ll be redirected to complete it over HTTPS, and we never see or store your card
          details.
        </span>
      </p>
    </form>
  )
}
