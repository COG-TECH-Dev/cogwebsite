'use client'

import { useActionState } from 'react'

import type { FormState } from '@/app/(frontend)/connect/actions'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }

const LETTER_TYPES = [
  { value: 'character', label: 'Character Reference' },
  { value: 'membership-confirmation', label: 'Membership Confirmation' },
  { value: 'financial', label: 'Financial Reference' },
  { value: 'other', label: 'Other' },
]

export function EnquiryForm({
  action,
  showPreferredDate = false,
  ministries,
  defaultMinistryId,
  showReferenceLetterFields = false,
  submitLabel = 'Send',
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  showPreferredDate?: boolean
  ministries?: { id: number; name: string }[]
  defaultMinistryId?: number
  showReferenceLetterFields?: boolean
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState(action, initialState)

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
      {ministries && ministries.length > 0 && (
        <div>
          <label htmlFor="interestedMinistry" className="mb-1 block text-sm font-medium text-ink">
            Which ministry would you like to join?
          </label>
          <select id="interestedMinistry" name="interestedMinistry" className="input" defaultValue={defaultMinistryId ?? ''}>
            <option value="">Not sure yet</option>
            {ministries.map((ministry) => (
              <option key={ministry.id} value={ministry.id}>
                {ministry.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {showReferenceLetterFields && (
        <>
          <div>
            <label htmlFor="letterType" className="mb-1 block text-sm font-medium text-ink">
              Letter Type
            </label>
            <select id="letterType" name="letterType" required className="input">
              {LETTER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="purpose" className="mb-1 block text-sm font-medium text-ink">
              Purpose of Letter
            </label>
            <input id="purpose" name="purpose" type="text" required className="input" />
          </div>
          <div>
            <label htmlFor="requiredByDate" className="mb-1 block text-sm font-medium text-ink">
              Required By (optional)
            </label>
            <input id="requiredByDate" name="requiredByDate" type="date" className="input" />
          </div>
        </>
      )}
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">
          {showReferenceLetterFields ? 'Additional Notes (optional)' : 'Message'}
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
