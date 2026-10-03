'use client'

import { useActionState } from 'react'

import { submitPrayerRequest, type FormState } from '@/app/(frontend)/connect/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }

// Private is first, so it's the default selection.
const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private', help: 'only our prayer team will see it' },
  { value: 'ministry-team', label: 'Ministry team', help: 'shared with our ministry leaders so they can pray too' },
  {
    value: 'public',
    label: 'Public prayer wall',
    help: 'shown on our website after we have read it (first name only)',
  },
]

export function PrayerRequestForm() {
  const [state, formAction, pending] = useActionState(submitPrayerRequest, initialState)

  if (state.status === 'success') {
    return <p className="rounded-xl bg-brand-50 p-6 text-brand-700">{state.message}</p>
  }

  return (
    <form action={formAction} className="space-y-5">
      <Honeypot />
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
          Name
        </label>
        <input id="name" name="name" type="text" required className="input" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
            Email
          </label>
          <input id="email" name="email" type="email" className="input" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink">
            Phone
          </label>
          <input id="phone" name="phone" type="tel" className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="request" className="mb-1 block text-sm font-medium text-ink">
          Your Prayer Request
        </label>
        <textarea id="request" name="request" required rows={5} className="input" />
      </div>
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-ink">Who may see this request?</legend>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map((option, i) => (
            <label key={option.value} className="flex items-start gap-2 text-sm text-ink-muted">
              <input
                type="radio"
                name="visibility"
                value={option.value}
                defaultChecked={i === 0}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>
                <span className="font-medium text-ink">{option.label}</span> — {option.help}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <ConsentNotice />
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : 'Submit Prayer Request'}
      </button>
    </form>
  )
}
