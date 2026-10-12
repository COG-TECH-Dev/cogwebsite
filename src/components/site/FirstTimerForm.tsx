'use client'

import { useActionState, useState, startTransition, type FormEvent } from 'react'
import Link from 'next/link'

import { submitFirstTimer, type FormState } from '@/app/(frontend)/connect/actions'
import { COUNTRIES } from '@/lib/countries'
import { CONTACT_PREFERENCES, HOW_HEARD, VISITOR_INTENTS, VISITOR_TYPES } from '@/lib/firstTimer'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }

const label = 'mb-1 block text-sm font-medium text-ink'
const legend = 'mb-2 block text-sm font-medium text-ink'
const choice = 'flex items-start gap-2.5 text-sm text-ink'
const control = 'mt-0.5 size-4 shrink-0 accent-brand-600'

// A red star after the name of a question that has to be answered, as on the church's own form.
const Star = () => (
  <span className="text-red-600" aria-hidden="true">
    {' '}
    *
  </span>
)

/**
 * The first-time visitor form. It is the church's own "New Member" Google Form, question for question and in the
 * same order and wording, so the welcome team recognises it. The only addition is "Which church did you visit?",
 * for the churches outside Newcastle (which has to be chosen). Every question is on the page; the ones marked * have
 * to be answered (both a phone number and an email address, and which description fits the visitor, as the welcome
 * team asked).
 */
export function FirstTimerForm({
  campuses,
  homegroups,
}: {
  campuses: string[]
  homegroups: { id: number; area: string }[]
}) {
  const [state, formAction, pending] = useActionState(submitFirstTimer, initialState)
  const [contact, setContact] = useState('yes')
  const [heard, setHeard] = useState('')

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
      <p className="text-xs text-ink-muted">
        <span className="text-red-600" aria-hidden="true">
          *
        </span>{' '}
        Required
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ft-first" className={label}>
            First Name
            <Star />
          </label>
          <input id="ft-first" name="firstName" type="text" required autoComplete="given-name" className="input" />
        </div>
        <div>
          <label htmlFor="ft-last" className={label}>
            Last Name
            <Star />
          </label>
          <input id="ft-last" name="lastName" type="text" required autoComplete="family-name" className="input" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ft-date" className={label}>
            Date of First Visit
            <Star />
          </label>
          <input id="ft-date" name="visitDate" type="date" required className="input" />
        </div>
        {campuses.length > 0 && (
          <div>
            <label htmlFor="ft-campus" className={label}>
              Which church did you visit?
              <Star />
            </label>
            <select id="ft-campus" name="campus" required className="input" defaultValue="">
              <option value="" disabled>
                Choose
              </option>
              {campuses.map((campus) => (
                <option key={campus} value={campus}>
                  {campus}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ft-phone" className={label}>
            Phone Number
            <Star />
          </label>
          <input id="ft-phone" name="phone" type="tel" required autoComplete="tel" className="input" />
        </div>
        <div>
          <label htmlFor="ft-email" className={label}>
            Email Address
            <Star />
          </label>
          <input id="ft-email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
      </div>

      <div>
        <label htmlFor="ft-address" className={label}>
          Address
          <Star />
        </label>
        <input id="ft-address" name="address" type="text" required autoComplete="address-line1" className="input" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ft-postcode" className={label}>
            Post Code
            <Star />
          </label>
          <input id="ft-postcode" name="postcode" type="text" required autoComplete="postal-code" className="input" />
        </div>
        <div>
          <label htmlFor="ft-city" className={label}>
            City
            <Star />
          </label>
          <input id="ft-city" name="city" type="text" required autoComplete="address-level2" className="input" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ft-country" className={label}>
            Country
            <Star />
          </label>
          <select id="ft-country" name="country" required autoComplete="country-name" className="input" defaultValue="">
            <option value="" disabled>
              Choose
            </option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
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
      </div>

      <fieldset>
        <legend className={legend}>
          Can we Contact You?
          <Star />
        </legend>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {CONTACT_PREFERENCES.map((o) => (
            <label key={o.value} className={choice}>
              <input
                type="radio"
                name="contactPreference"
                value={o.value}
                required
                checked={contact === o.value}
                onChange={() => setContact(o.value)}
                className={control}
              />
              {o.label}
            </label>
          ))}
        </div>
        {contact === 'other' && (
          <div className="mt-3">
            <label htmlFor="ft-contact-other" className={label}>
              Other (please tell us how or when to reach you)
              <Star />
            </label>
            <input id="ft-contact-other" name="contactOther" type="text" required className="input" />
          </div>
        )}
      </fieldset>

      <div>
        <label htmlFor="ft-heard" className={label}>
          How did you hear about us
        </label>
        <select id="ft-heard" name="howHeard" className="input" value={heard} onChange={(e) => setHeard(e.target.value)}>
          <option value="">Choose</option>
          {HOW_HEARD.map((option) => (
            <option key={option} value={option}>
              {option === 'Other' ? 'Other (please specify)' : option}
            </option>
          ))}
        </select>
        {heard === 'Other' && (
          <div className="mt-3">
            <label htmlFor="ft-heard-other" className={label}>
              Please specify
              <Star />
            </label>
            <input id="ft-heard-other" name="howHeardOther" type="text" required className="input" />
          </div>
        )}
      </div>

      <fieldset>
        <legend className={legend}>Newsletter</legend>
        <label className={choice}>
          <input type="checkbox" name="newsletterOptIn" className={control} />
          Send me the church newsletter
        </label>
      </fieldset>

      <div>
        <label htmlFor="ft-message" className={label}>
          Prayer request
        </label>
        <textarea id="ft-message" name="message" rows={3} className="input" />
      </div>

      <fieldset>
        <legend className={legend}>
          Please select the one applicable to you
          <Star />
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {VISITOR_TYPES.map((o) => (
            <label key={o.value} className={choice}>
              <input type="radio" name="visitorType" value={o.value} required className={control} />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={legend}>Please select from the following that applies to you</legend>
        <div className="space-y-2">
          {VISITOR_INTENTS.map((o) => (
            <label key={o.value} className={choice}>
              <input type="checkbox" name="intents" value={o.value} className={control} />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <ConsentNotice marked />
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
