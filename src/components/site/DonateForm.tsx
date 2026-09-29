'use client'

import { useActionState, useState } from 'react'

import { createDonationCheckout, type DonateState } from '@/app/(frontend)/give/donate/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: DonateState = { status: 'idle' }
const QUICK_AMOUNTS = [10, 25, 50, 100]

export function DonateForm({ funds }: { funds: { name: string; description?: string }[] }) {
  const [state, formAction, pending] = useActionState(createDonationCheckout, initialState)
  const [amount, setAmount] = useState<number | null>(25)
  const [customAmount, setCustomAmount] = useState('')
  const [giftAid, setGiftAid] = useState(false)

  return (
    <form action={formAction} className="space-y-6">
      <Honeypot />

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

      <div>
        <p className="mb-2 block text-sm font-medium text-ink">Frequency</p>
        <div className="grid grid-cols-2 gap-2">
          {(['one-time', 'monthly'] as const).map((freq) => (
            <label
              key={freq}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 text-sm font-medium text-ink has-checked:border-gold-500 has-checked:bg-gold-100 has-checked:text-brand-700"
            >
              <input
                type="radio"
                name="frequency"
                value={freq}
                defaultChecked={freq === 'one-time'}
                className="sr-only"
              />
              {freq === 'one-time' ? 'One-Time' : 'Monthly'}
            </label>
          ))}
        </div>
      </div>

      {funds.length > 0 && (
        <div>
          <label htmlFor="fund" className="mb-1 block text-sm font-medium text-ink">
            Fund
          </label>
          <select id="fund" name="fund" className="input" defaultValue={funds[0]?.name}>
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
      <p className="text-center text-xs text-ink-muted">
        You&apos;ll be securely redirected to Stripe to complete your payment.
      </p>
    </form>
  )
}
