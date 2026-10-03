'use client'

import { useActionState } from 'react'

import { submitEventRegistration, type RsvpState } from '@/app/(frontend)/programmes/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: RsvpState = { status: 'idle' }

export function EventRegistrationForm({ eventId }: { eventId: number }) {
  const [state, formAction, pending] = useActionState(
    submitEventRegistration.bind(null, eventId),
    initialState,
  )

  if (state.status === 'success') {
    return <p className="text-sm font-medium text-white">{state.message}</p>
  }

  return (
    <form action={formAction} className="mt-4 space-y-3 text-left">
      <Honeypot />
      <input
        name="name"
        type="text"
        required
        placeholder="Full name"
        className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-gold-300 focus:outline-none"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-gold-300 focus:outline-none"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone (optional)"
        className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-gold-300 focus:outline-none"
      />
      <div>
        <label htmlFor="guests" className="mb-1 block text-xs font-medium text-white/80">
          Number attending (including you)
        </label>
        <input
          id="guests"
          name="guests"
          type="number"
          min={1}
          defaultValue={1}
          className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white focus:border-gold-300 focus:outline-none"
        />
      </div>
      <ConsentNotice dark />
      {state.status === 'error' && <p className="text-sm text-gold-200">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-300 disabled:opacity-60"
      >
        {pending ? 'Reserving…' : 'Reserve My Spot'}
      </button>
    </form>
  )
}
