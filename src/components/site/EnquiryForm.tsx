'use client'

import { useActionState, useState } from 'react'

import type { FormState } from '@/app/(frontend)/connect/actions'
import { LETTER_TYPES } from '@/lib/letters'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }

const SUPPORT_TYPES = [
  { value: 'financial', label: 'Financial' },
  { value: 'counselling', label: 'Counselling' },
  { value: 'food', label: 'Food / Practical Needs' },
  { value: 'other', label: 'Other' },
]

export function EnquiryForm({
  action,
  showPreferredDate = false,
  ministries,
  defaultMinistryId,
  showReferenceLetterFields = false,
  defaultLetterType,
  homegroups,
  showSupportType = false,
  defaultSupportType,
  submitLabel = 'Send',
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  showPreferredDate?: boolean
  ministries?: { id: number; name: string }[]
  defaultMinistryId?: number
  showReferenceLetterFields?: boolean
  /** The letter type chosen when the form opens (the Life Events page links to the school letter). */
  defaultLetterType?: string
  /** Home group names, for the school letter's "home group" question. */
  homegroups?: string[]
  showSupportType?: boolean
  defaultSupportType?: string
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const [letterType, setLetterType] = useState(defaultLetterType ?? LETTER_TYPES[0].value)
  const isSchool = letterType === 'school'

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
      {showSupportType && (
        <div>
          <label htmlFor="supportType" className="mb-1 block text-sm font-medium text-ink">
            What kind of support are you looking for?
          </label>
          <select id="supportType" name="supportType" required className="input" defaultValue={defaultSupportType}>
            {SUPPORT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
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
            <select id="letterType" name="letterType" required className="input" value={letterType} onChange={(e) => setLetterType(e.target.value)}>
              {LETTER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {isSchool ? (
            <>
              <p className="rounded-xl bg-brand-50 p-4 text-sm text-ink-muted">
                Applying to a faith school? You may be asked for a letter confirming that you attend church. Please give the details below.
              </p>
              <div>
                <label htmlFor="childName" className="mb-1 block text-sm font-medium text-ink">
                  Child&apos;s full name
                </label>
                <input id="childName" name="childName" type="text" required className="input" />
              </div>
              <div>
                <label htmlFor="childDob" className="mb-1 block text-sm font-medium text-ink">
                  Child&apos;s date of birth
                </label>
                <input id="childDob" name="childDob" type="date" required className="input" />
              </div>
              <div>
                <label htmlFor="parentNames" className="mb-1 block text-sm font-medium text-ink">
                  Parents&apos; full names
                </label>
                <input id="parentNames" name="parentNames" type="text" required className="input" />
              </div>
              <div>
                <label htmlFor="homeAddress" className="mb-1 block text-sm font-medium text-ink">
                  Home address (with postcode)
                </label>
                <textarea id="homeAddress" name="homeAddress" rows={3} required autoComplete="street-address" className="input" />
              </div>
              <div>
                <label htmlFor="homegroup" className="mb-1 block text-sm font-medium text-ink">
                  Your home group
                </label>
                <select id="homegroup" name="homegroup" className="input" defaultValue="">
                  <option value="">I don&apos;t have one yet</option>
                  {(homegroups ?? []).map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="purpose" className="mb-1 block text-sm font-medium text-ink">
                Purpose of Letter
              </label>
              <input id="purpose" name="purpose" type="text" required className="input" />
            </div>
          )}
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
      <ConsentNotice />
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : submitLabel}
      </button>
    </form>
  )
}
