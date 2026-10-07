'use client'

import { useActionState, startTransition, type FormEvent } from 'react'

import { submitMinistryMessage, type FormState } from '@/app/(frontend)/connect/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }

const field =
  'w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-gold-300 focus:outline-none'

/**
 * A short private message to a ministry's team, on a dark background (the Ablaze Youth page).
 * It never shows the team's address: the message is saved and emailed to them.
 */
export function MinistryMessageForm({ ministryId }: { ministryId: number }) {
  const [state, formAction, pending] = useActionState(submitMinistryMessage.bind(null, ministryId), initialState)

  // Sending the data ourselves keeps what was typed if something goes wrong, instead of clearing the form.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(() => formAction(data))
  }

  if (state.status === 'success') {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-base font-medium text-white" role="status">
        {state.message}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
      <Honeypot />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" type="text" required placeholder="Your name" aria-label="Your name" autoComplete="name" className={field} />
        <input name="email" type="email" required placeholder="Your email" aria-label="Your email" autoComplete="email" className={field} />
      </div>
      <input name="phone" type="tel" placeholder="Phone (optional)" aria-label="Phone (optional)" autoComplete="tel" className={field} />
      <textarea
        name="message"
        rows={4}
        required
        placeholder="Your question or message"
        aria-label="Your question or message"
        className={field}
      />
      <ConsentNotice dark />
      {state.status === 'error' && (
        <p className="text-sm text-gold-200" role="alert">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gold-300 px-6 py-3 text-sm font-bold text-brand-900 transition-colors hover:bg-white disabled:opacity-60 sm:w-auto"
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
