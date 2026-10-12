'use client'

import { useActionState } from 'react'
import Link from 'next/link'

import { submitStepOfFaith, type StepOfFaithState } from '@/app/(frontend)/connect/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: StepOfFaithState = { status: 'idle' }

// A red star after the name of a question that has to be answered.
const Star = () => (
  <span className="text-red-600" aria-hidden="true">
    {' '}
    *
  </span>
)

const DECISIONS = [
  { value: 'first-time', label: "I'm trusting Jesus for the first time" },
  { value: 'recommitting', label: "I'm recommitting my life to Christ" },
  { value: 'learn-more', label: 'I want to learn more before deciding' },
]

export function StepOfFaithForm() {
  const [state, formAction, pending] = useActionState(submitStepOfFaith, initialState)

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-border bg-brand-50 p-8">
        <h3 className="font-serif text-xl font-semibold text-brand-700">What&apos;s Next?</h3>
        <p className="mt-2 text-ink-muted">Wherever you are in your journey, here are a few ways to keep going:</p>
        <ul className="mt-5 space-y-3">
          <li>
            <Link href="/resources#start-here" className="font-semibold text-brand-600 hover:underline">
              Browse Resources for New Believers →
            </Link>
          </li>
          <li>
            <Link href="/connect/new-here" className="font-semibold text-brand-600 hover:underline">
              Join Us at a Service →
            </Link>
          </li>
          <li>
            <Link href="/connect/homegroups" className="font-semibold text-brand-600 hover:underline">
              Find a Homegroup Near You →
            </Link>
          </li>
          <li>
            <Link href="/connect/contact" className="font-semibold text-brand-600 hover:underline">
              Contact Us →
            </Link>
          </li>
        </ul>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <Honeypot />
      <div>
        <label htmlFor="decisionType" className="mb-1 block text-sm font-medium text-ink">
          Which best describes your decision today?
          <Star />
        </label>
        <select id="decisionType" name="decisionType" required className="input">
          <option value="">Please select</option>
          {DECISIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-ink-muted">
        <Star /> Please give your name, email and phone number so that one of our team can get in touch with you.
      </p>
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
          Full Name
          <Star />
        </label>
        <input id="name" name="name" type="text" required autoComplete="name" className="input" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
            Email
            <Star />
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink">
            Phone
            <Star />
          </label>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" className="input" />
        </div>
      </div>
      <ConsentNotice marked />
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}
