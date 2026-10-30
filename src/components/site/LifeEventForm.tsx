'use client'

import { useActionState, useState } from 'react'

import { submitLifeEvent, type FormState } from '@/app/(frontend)/connect/actions'
import { DEDICATION_NOTICE_DAYS, LIFE_EVENT_TYPES } from '@/lib/lifeEvents'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }
const label = 'mb-1 block text-sm font-medium text-ink'

// A red star after the name of a question that has to be answered.
const Star = () => (
  <span className="text-red-600" aria-hidden="true">
    {' '}
    *
  </span>
)

/**
 * The request form for a baby dedication or a naming ceremony. It asks what the church office asks for by email, in one
 * place; the office receives it by email (with the church's own subject line) and it is saved in the admin.
 */
export function LifeEventForm({
  defaultType,
  dedicationDates,
  homegroups,
}: {
  defaultType?: string
  dedicationDates: { value: string; label: string }[]
  homegroups: string[]
}) {
  const [state, formAction, pending] = useActionState(submitLifeEvent, initialState)
  const [type, setType] = useState(LIFE_EVENT_TYPES.some((t) => t.value === defaultType) ? defaultType! : LIFE_EVENT_TYPES[0].value)

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-border bg-brand-50 p-8" role="status">
        <p className="font-serif text-xl font-semibold text-brand-700">{state.message}</p>
      </div>
    )
  }

  const dedication = type === 'baby-dedication'

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <Honeypot />
      <p className="text-xs text-ink-muted">
        <span className="text-red-600" aria-hidden="true">
          *
        </span>{' '}
        Required
      </p>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-ink">
          What would you like to request?
          <Star />
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {LIFE_EVENT_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-2.5 text-sm text-ink">
              <input
                type="radio"
                name="type"
                value={t.value}
                required
                checked={type === t.value}
                onChange={() => setType(t.value)}
                className="size-4 accent-brand-600"
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="le-name" className={label}>
            Your name
            <Star />
          </label>
          <input id="le-name" name="name" type="text" required autoComplete="name" className="input" />
        </div>
        <div>
          <label htmlFor="le-phone" className={label}>
            Phone
            <Star />
          </label>
          <input id="le-phone" name="phone" type="tel" required autoComplete="tel" className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="le-email" className={label}>
          Email
          <Star />
        </label>
        <input id="le-email" name="email" type="email" required autoComplete="email" className="input" />
      </div>

      {dedication ? (
        <>
          <div>
            <label htmlFor="le-sunday" className={label}>
              Which Sunday would you like?
              <Star />
            </label>
            <select id="le-sunday" name="dedicationDate" required className="input" defaultValue="">
              <option value="" disabled>
                Choose
              </option>
              {dedicationDates.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-muted">
              Dedications are on the last Sunday of the month, and we need at least {DEDICATION_NOTICE_DAYS} days&apos; notice.
            </p>
          </div>
          <div>
            <label htmlFor="le-child" className={label}>
              Your child&apos;s name (optional)
            </label>
            <input id="le-child" name="childName" type="text" className="input" />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="le-date" className={label}>
                Date you would like
                <Star />
              </label>
              <input id="le-date" name="namingDate" type="date" required className="input" />
            </div>
            <div>
              <label htmlFor="le-time" className={label}>
                Start time
                <Star />
              </label>
              <input id="le-time" name="namingTime" type="time" required className="input" />
            </div>
          </div>
          <div>
            <label htmlFor="le-address" className={label}>
              Home address
              <Star />
            </label>
            <input id="le-address" name="address" type="text" required autoComplete="address-line1" className="input" />
            <p className="mt-1 text-xs text-ink-muted">A pastor will visit your home for the ceremony.</p>
          </div>
          <div>
            <label htmlFor="le-postcode" className={label}>
              Postcode
              <Star />
            </label>
            <input id="le-postcode" name="postcode" type="text" required autoComplete="postal-code" className="input sm:max-w-xs" />
          </div>
          <div>
            <label htmlFor="le-names" className={label}>
              The names you will call your child, and their meanings (optional)
            </label>
            <textarea id="le-names" name="childNames" rows={3} className="input" />
            <p className="mt-1 text-xs text-ink-muted">You can also give these to the pastor on the day.</p>
          </div>
        </>
      )}

      <div>
        <label htmlFor="le-homegroup" className={label}>
          Your home group
          <Star />
        </label>
        <select id="le-homegroup" name="homegroup" required className="input" defaultValue="">
          <option value="" disabled>
            Choose
          </option>
          <option value="I don't have one yet">I don&apos;t have one yet</option>
          {homegroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="le-notes" className={label}>
          Anything else we should know (optional)
        </label>
        <textarea id="le-notes" name="message" rows={3} className="input" />
      </div>

      <ConsentNotice marked />
      {state.status === 'error' && (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : 'Send my request'}
      </button>
    </form>
  )
}
