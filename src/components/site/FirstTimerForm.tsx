'use client'

import { useActionState, useState, startTransition, type FormEvent } from 'react'
import Link from 'next/link'

import { submitFirstTimer, type FormState } from '@/app/(frontend)/connect/actions'
import { CONTACT_PREFERENCES, VISITOR_INTENTS, VISITOR_TYPES } from '@/lib/firstTimer'
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

const label = 'mb-1 block text-sm font-medium text-ink'
const legend = 'mb-2 block text-sm font-medium text-ink'
const choice = 'flex items-start gap-2.5 text-sm text-ink'
const control = 'mt-0.5 size-4 shrink-0 accent-brand-600'

/**
 * The first-time visitor form. It asks the same questions as the church's own
 * "New Member" form, but only six sit on the first screen (name, a way to reach
 * you, the day you came and where) so it stays quick on a phone; the rest are in
 * the optional "tell us a little more" section.
 */
export function FirstTimerForm({
  campuses,
  homegroups,
}: {
  campuses: string[]
  homegroups: { id: number; area: string }[]
}) {
  const [state, formAction, pending] = useActionState(submitFirstTimer, initialState)
  // Either an email or a phone number is enough — but one of them is needed.
  // Making each required only while the other is empty lets the browser catch
  // this before submitting, so nobody loses what they typed to a server error.
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Submitting through a React form action clears every field when the server
  // says no (for example a network error). Sending the data ourselves keeps what
  // the visitor typed so they can simply try again.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(() => formAction(data))
  }

  if (state.status === 'success') {
    // Not a dead-end "thanks" — point at a next step.
    return (
      <div className="rounded-2xl border border-border bg-brand-50 p-8" role="status">
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
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ft-first" className={label}>
            First name
          </label>
          <input id="ft-first" name="firstName" type="text" required autoComplete="given-name" className="input" />
        </div>
        <div>
          <label htmlFor="ft-last" className={label}>
            Last name
          </label>
          <input id="ft-last" name="lastName" type="text" required autoComplete="family-name" className="input" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ft-email" className={label}>
            Email
          </label>
          <input
            id="ft-email"
            name="email"
            type="email"
            autoComplete="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={!phone}
          />
        </div>
        <div>
          <label htmlFor="ft-phone" className={label}>
            Phone
          </label>
          <input
            id="ft-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
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
          <label htmlFor="ft-date" className={label}>
            Date of your first visit
          </label>
          <input id="ft-date" name="visitDate" type="date" className="input" />
          <p className="mt-1 text-xs text-ink-muted">Leave blank if it was today.</p>
        </div>
        <div>
          <label htmlFor="ft-campus" className={label}>
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
      </div>

      <details className="group rounded-xl border border-border bg-brand-50/50">
        <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-sm font-semibold text-brand-700 marker:hidden [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">+ Tell us a little more (optional)</span>
          <span className="hidden group-open:inline">− Tell us a little more (optional)</span>
        </summary>
        <div className="space-y-5 border-t border-border p-4">
          <div>
            <label htmlFor="ft-service" className={label}>
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

          <div>
            <label htmlFor="ft-address" className={label}>
              Address
            </label>
            <input id="ft-address" name="address" type="text" autoComplete="address-line1" className="input" />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="ft-city" className={label}>
                City
              </label>
              <input id="ft-city" name="city" type="text" autoComplete="address-level2" className="input" />
            </div>
            <div>
              <label htmlFor="ft-postcode" className={label}>
                Post code
              </label>
              <input id="ft-postcode" name="postcode" type="text" autoComplete="postal-code" className="input" />
            </div>
            <div>
              <label htmlFor="ft-country" className={label}>
                Country
              </label>
              <input id="ft-country" name="country" type="text" autoComplete="country-name" className="input" />
            </div>
          </div>

          <div>
            <label htmlFor="ft-homegroup" className={label}>
              Home group
            </label>
            <select id="ft-homegroup" name="interestedHomegroup" className="input" defaultValue="">
              <option value="">I don&apos;t have one yet</option>
              {homegroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ft-heard" className={label}>
              How did you hear about us?
            </label>
            <input id="ft-heard" name="howHeard" type="text" className="input" />
          </div>

          <fieldset>
            <legend className={legend}>Which of these describes you?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {VISITOR_TYPES.map((o) => (
                <label key={o.value} className={choice}>
                  <input type="radio" name="visitorType" value={o.value} className={control} />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={legend}>Is any of this true for you?</legend>
            <div className="space-y-2">
              {VISITOR_INTENTS.map((o) => (
                <label key={o.value} className={choice}>
                  <input type="checkbox" name="intents" value={o.value} className={control} />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={legend}>Can we contact you?</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {CONTACT_PREFERENCES.map((o) => (
                <label key={o.value} className={choice}>
                  <input type="radio" name="contactPreference" value={o.value} defaultChecked={o.value === 'yes'} className={control} />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className={choice}>
            <input type="checkbox" name="newsletterOptIn" className={control} />
            Send me the church newsletter
          </label>

          <div>
            <label htmlFor="ft-message" className={label}>
              Anything we can pray about or help with?
            </label>
            <textarea id="ft-message" name="message" rows={3} className="input" />
          </div>
        </div>
      </details>

      <ConsentNotice />
      {state.status === 'error' && (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : "I've Visited — Say Hello"}
      </button>
    </form>
  )
}
