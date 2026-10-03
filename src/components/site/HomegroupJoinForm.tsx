'use client'

import { useActionState } from 'react'

import { submitHomegroupJoin, type FormState } from '@/app/(frontend)/connect/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }

export function HomegroupJoinForm({ homegroups }: { homegroups: { id: number; name: string; area: string }[] }) {
  const [state, formAction, pending] = useActionState(submitHomegroupJoin, initialState)

  if (state.status === 'success') {
    return <p className="rounded-xl bg-brand-50 p-6 text-brand-700">{state.message}</p>
  }

  return (
    <form action={formAction} className="space-y-5">
      <Honeypot />
      <div>
        <label htmlFor="interestedHomegroup" className="mb-1 block text-sm font-medium text-ink">
          Which homegroup would you like to join?
        </label>
        <select id="interestedHomegroup" name="interestedHomegroup" className="input" defaultValue="">
          <option value="">Not sure — help me find one near me</option>
          {homegroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.area}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
            Name
          </label>
          <input id="name" name="name" type="text" required className="input" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink">
            Phone Number
          </label>
          <input id="phone" name="phone" type="tel" required className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          Email (optional)
        </label>
        <input id="email" name="email" type="email" className="input" />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">
          Anything you&apos;d like us to know? (optional)
        </label>
        <textarea id="message" name="message" rows={3} className="input" />
      </div>
      <ConsentNotice />
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : 'Join a Homegroup'}
      </button>
    </form>
  )
}
