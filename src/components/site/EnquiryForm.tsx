'use client'

import { useActionState } from 'react'

import type { FormState } from '@/app/(frontend)/connect/actions'

const initialState: FormState = { status: 'idle' }

export function EnquiryForm({
  action,
  showPreferredDate = false,
  submitLabel = 'Send',
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  showPreferredDate?: boolean
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState(action, initialState)

  if (state.status === 'success') {
    return <p className="rounded-xl bg-brand-50 p-6 text-brand-700">{state.message}</p>
  }

  return (
    <form action={formAction} className="space-y-5">
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
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink">
            Phone
          </label>
          <input id="phone" name="phone" type="tel" className="input" />
        </div>
      </div>
      {showPreferredDate && (
        <div>
          <label htmlFor="preferredDate" className="mb-1 block text-sm font-medium text-ink">
            Preferred Date
          </label>
          <input id="preferredDate" name="preferredDate" type="date" className="input" />
        </div>
      )}
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">
          Message
        </label>
        <textarea id="message" name="message" rows={5} className="input" />
      </div>
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : submitLabel}
      </button>
    </form>
  )
}
