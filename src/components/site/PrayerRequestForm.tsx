'use client'

import { useActionState } from 'react'

import { submitPrayerRequest, type FormState } from '@/app/(frontend)/connect/actions'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }

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
      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input type="checkbox" name="isConfidential" className="h-4 w-4 rounded border-border" />
        Keep this confidential
      </label>
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : 'Submit Prayer Request'}
      </button>
    </form>
  )
}
