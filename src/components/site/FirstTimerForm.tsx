'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'

import { submitFirstTimer, type FormState } from '@/app/(frontend)/connect/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }

const SERVICES = [
  'Sunday First Service',
  'Sunday Second Service',
  'Sunday Third Service',
  'Midweek Service',
  'Another gathering',
]

export function FirstTimerForm({ campuses }: { campuses: string[] }) {
  const [state, formAction, pending] = useActionState(submitFirstTimer, initialState)
  // Either an email or a phone number is enough — but one of them is needed.
  // Making each required only while the other is empty lets the browser catch
  // this before submitting, so nobody loses what they typed to a server error.
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  if (state.status === 'success') {
    // Not a dead-end "thanks" — point at a next step.
    return (
      <div className="rounded-2xl border border-border bg-brand-50 p-8">
        <p className="font-serif text-xl font-semibold text-brand-700">{state.message}</p>
        <p className="mt-3 text-ink-muted">Here are some good next steps:</p>
        <ul className="mt-4 space-y-2">
          <li>
            <Link href="/connect/homegroups#join" className="font-semibold text-brand-600 hover:underline">
              Join a homegroup →
            </Link>
          </li>
          <li>
            <Link href="/ministries" className="font-semibold text-brand-600 hover:underline">
              Find a ministry to get involved in →
            </Link>
          </li>
          <li>
            <Link href="/connect/next-steps" className="font-semibold text-brand-600 hover:underline">
              Take a step of faith →
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
        <label htmlFor="ft-name" className="mb-1 block text-sm font-medium text-ink">
          Name
        </label>
        <input id="ft-name" name="name" type="text" required className="input" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ft-email" className="mb-1 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="ft-email"
            name="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={!phone}
          />
        </div>
        <div>
          <label htmlFor="ft-phone" className="mb-1 block text-sm font-medium text-ink">
            Phone
          </label>
          <input
            id="ft-phone"
            name="phone"
            type="tel"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required={!email}
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-ink-muted">Please give at least an email or a phone number.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ft-campus" className="mb-1 block text-sm font-medium text-ink">
            Which church did you visit?
          </label>
          <select id="ft-campus" name="campus" className="input" defaultValue={campuses[0] ?? ''}>
            {campuses.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ft-service" className="mb-1 block text-sm font-medium text-ink">
            Which service?
          </label>
          <select id="ft-service" name="serviceAttended" className="input" defaultValue={SERVICES[0]}>
            {SERVICES.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="ft-message" className="mb-1 block text-sm font-medium text-ink">
          Anything we can pray about or help with? (optional)
        </label>
        <textarea id="ft-message" name="message" rows={3} className="input" />
      </div>
      <ConsentNotice />
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : "I've Visited — Say Hello"}
      </button>
    </form>
  )
}
