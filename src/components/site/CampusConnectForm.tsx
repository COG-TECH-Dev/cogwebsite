'use client'

import { useActionState } from 'react'

import { submitCampusConnect, type FormState } from '@/app/(frontend)/connect/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }

export function CampusConnectForm({ campuses }: { campuses: string[] }) {
  const [state, formAction, pending] = useActionState(submitCampusConnect, initialState)

  if (state.status === 'success') {
    return <p className="rounded-xl bg-brand-50 p-6 text-brand-700">{state.message}</p>
  }

  return (
    <form action={formAction} className="space-y-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cc-name" className="mb-1 block text-sm font-medium text-ink">
            Name
          </label>
          <input id="cc-name" name="name" type="text" required className="input" />
        </div>
        <div>
          <label htmlFor="cc-email" className="mb-1 block text-sm font-medium text-ink">
            Email
          </label>
          <input id="cc-email" name="email" type="email" required className="input" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cc-phone" className="mb-1 block text-sm font-medium text-ink">
            Phone (optional)
          </label>
          <input id="cc-phone" name="phone" type="tel" className="input" />
        </div>
        <div>
          <label htmlFor="cc-campus" className="mb-1 block text-sm font-medium text-ink">
            Closest church to you
          </label>
          <select id="cc-campus" name="campus" className="input" defaultValue="Not sure — help me choose">
            <option value="Not sure — help me choose">Not sure — help me choose</option>
            {campuses.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="cc-message" className="mb-1 block text-sm font-medium text-ink">
          Where are you moving, and when? (city / university)
        </label>
        <textarea id="cc-message" name="message" rows={3} className="input" />
      </div>
      <ConsentNotice />
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : 'Connect Me to a Church'}
      </button>
    </form>
  )
}
