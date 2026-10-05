'use client'

import { useActionState, useState, startTransition, type FormEvent } from 'react'

import { submitEventRegistration, type RsvpState } from '@/app/(frontend)/programmes/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: RsvpState = { status: 'idle' }

const field =
  'w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-gold-300 focus:outline-none'

/**
 * The sign-up box on an event page. Depending on how the event is set up it offers
 * "I'm coming", "I'd like to volunteer", or both. Volunteers say how they would like
 * to help and do not use up attendee places.
 */
export function EventRegistrationForm({
  eventId,
  canAttend,
  canVolunteer,
}: {
  eventId: number
  canAttend: boolean
  canVolunteer: boolean
}) {
  const [state, formAction, pending] = useActionState(submitEventRegistration.bind(null, eventId), initialState)
  const [role, setRole] = useState<'attendee' | 'volunteer'>(canAttend ? 'attendee' : 'volunteer')
  const volunteering = role === 'volunteer'

  // Sending the data ourselves keeps what was typed if the server says no (for
  // example "Only 2 spots left"), instead of clearing the form.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(() => formAction(data))
  }

  if (state.status === 'success') {
    return (
      <p className="mt-4 text-sm font-medium text-white" role="status">
        {state.message}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 text-left">
      <Honeypot />
      {canAttend && canVolunteer && (
        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="mb-1 text-xs font-medium text-white/80">I would like to…</legend>
          {(
            [
              ['attendee', 'Come along'],
              ['volunteer', 'Volunteer'],
            ] as const
          ).map(([value, text]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-semibold transition-colors ${
                role === value ? 'border-gold-300 bg-gold-300 text-brand-900' : 'border-white/30 text-white hover:bg-white/10'
              }`}
            >
              <input
                type="radio"
                name="roleChoice"
                value={value}
                checked={role === value}
                onChange={() => setRole(value)}
                className="sr-only"
              />
              {text}
            </label>
          ))}
        </fieldset>
      )}
      <input type="hidden" name="role" value={role} />
      <input name="name" type="text" required placeholder="Full name" aria-label="Full name" autoComplete="name" className={field} />
      <input name="email" type="email" required placeholder="Email" aria-label="Email" autoComplete="email" className={field} />
      <input
        name="phone"
        type="tel"
        placeholder={volunteering ? 'Phone (so the team can reach you)' : 'Phone (optional)'}
        aria-label="Phone"
        autoComplete="tel"
        className={field}
      />
      {volunteering ? (
        <div>
          <label htmlFor="rsvp-notes" className="mb-1 block text-xs font-medium text-white/80">
            How would you like to help? (optional)
          </label>
          <textarea
            id="rsvp-notes"
            name="notes"
            rows={3}
            placeholder="For example setting up, welcoming people, handing out flyers, music, prayer…"
            className={field}
          />
        </div>
      ) : (
        <div>
          <label htmlFor="guests" className="mb-1 block text-xs font-medium text-white/80">
            Number attending (including you)
          </label>
          <input id="guests" name="guests" type="number" min={1} defaultValue={1} className={field} />
        </div>
      )}
      <ConsentNotice dark />
      {state.status === 'error' && (
        <p className="text-sm text-gold-200" role="alert">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-300 disabled:opacity-60"
      >
        {pending ? 'Sending…' : volunteering ? 'Offer to Help' : 'Reserve My Spot'}
      </button>
    </form>
  )
}
