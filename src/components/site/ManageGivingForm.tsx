'use client'

import { useActionState } from 'react'

import { openBillingPortal, type ManageGivingState } from '@/app/(frontend)/give/manage/actions'

const initialState: ManageGivingState = { status: 'idle' }

export function ManageGivingForm() {
  const [state, formAction, pending] = useActionState(openBillingPortal, initialState)

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          Email used when giving
        </label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Looking up your giving…' : 'Manage My Giving'}
      </button>
      <p className="text-center text-xs text-ink-muted">
        You&apos;ll be redirected to Stripe&apos;s secure portal to update or cancel your recurring gift.
      </p>
    </form>
  )
}
