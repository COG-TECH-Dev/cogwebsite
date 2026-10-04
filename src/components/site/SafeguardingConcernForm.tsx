'use client'

import Link from 'next/link'
import { useActionState, useState, startTransition, type FormEvent } from 'react'

import { submitSafeguardingConcern, type ConcernState } from '@/app/(frontend)/safeguarding/actions'
import { Honeypot } from './Honeypot'

const initialState: ConcernState = { status: 'idle' }

const RELATIONSHIPS = [
  { value: 'member', label: 'Church member' },
  { value: 'parent', label: 'Parent or carer' },
  { value: 'volunteer', label: 'Volunteer or leader' },
  { value: 'visitor', label: 'Visitor' },
  { value: 'child', label: 'Child or young person' },
  { value: 'other', label: 'Other' },
]

export function SafeguardingConcernForm() {
  const [state, formAction, pending] = useActionState(submitSafeguardingConcern, initialState)
  const [danger, setDanger] = useState(false)

  // React empties a form's fields once a `<form action>` finishes. If sending
  // failed, that would wipe a long, hard-to-write message, so submit by hand
  // and leave the fields as they are.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(() => formAction(data))
  }

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-border bg-brand-50 p-8" role="status">
        <p className="font-serif text-xl font-semibold text-brand-700">{state.message}</p>
        {state.reference && (
          <p className="mt-4 text-ink-muted">
            Your reference is <strong className="font-semibold text-ink">{state.reference}</strong>. Quote it if you
            contact us about this. We do not need your name or the child&apos;s name to find it.
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <Honeypot />

      <div>
        <label htmlFor="concern" className="mb-1 block text-sm font-medium text-ink">
          What are you worried about?
        </label>
        <p id="concern-help" className="mb-2 text-sm text-ink-muted">
          Say what you saw, heard or were told, as plainly as you can. If a child told you something, use their own
          words. Please do not question the child or look into it yourself.
        </p>
        <textarea id="concern" name="concern" rows={6} required aria-describedby="concern-help" className="input" />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border bg-brand-50 p-4 text-sm text-ink">
        <input
          type="checkbox"
          name="immediateDanger"
          checked={danger}
          onChange={(e) => setDanger(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>
          A child may be in danger right now.
          {danger && (
            <strong className="mt-1 block font-semibold text-red-700">
              Please call 999 now. This form does not reach the emergency services.
            </strong>
          )}
        </span>
      </label>

      <div>
        <label htmlFor="whenAndWhere" className="mb-1 block text-sm font-medium text-ink">
          When and where did it happen? (if you know)
        </label>
        <input id="whenAndWhere" name="whenAndWhere" type="text" className="input" />
      </div>

      <label className="flex items-start gap-3 text-sm text-ink">
        <input type="checkbox" name="involvesStaffOrVolunteer" className="mt-0.5 h-4 w-4 shrink-0" />
        <span>My concern is about someone who works or volunteers at the church.</span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="childName" className="mb-1 block text-sm font-medium text-ink">
            Child&apos;s name (if you know it)
          </label>
          <input id="childName" name="childName" type="text" className="input" />
        </div>
        <div>
          <label htmlFor="childAgeOrDob" className="mb-1 block text-sm font-medium text-ink">
            Their age or date of birth (if you know it)
          </label>
          <input id="childAgeOrDob" name="childAgeOrDob" type="text" className="input" />
        </div>
      </div>

      <div>
        <label htmlFor="othersTold" className="mb-1 block text-sm font-medium text-ink">
          Has anyone else been told, or has anything been done so far? (optional)
        </label>
        <textarea id="othersTold" name="othersTold" rows={3} className="input" />
      </div>

      <fieldset className="space-y-5 rounded-xl border border-border p-4 sm:p-5">
        <legend className="px-2 text-sm font-semibold text-ink">Your details (optional)</legend>
        <p className="-mt-1 text-sm text-ink-muted">
          You can send this without giving your name. It helps us if we can contact you with questions, but it is your
          choice.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="reporterName" className="mb-1 block text-sm font-medium text-ink">
              Your name
            </label>
            <input id="reporterName" name="reporterName" type="text" autoComplete="name" className="input" />
          </div>
          <div>
            <label htmlFor="relationship" className="mb-1 block text-sm font-medium text-ink">
              How are you connected to the church?
            </label>
            <select id="relationship" name="relationship" className="input" defaultValue="">
              <option value="">Prefer not to say</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="reporterPhone" className="mb-1 block text-sm font-medium text-ink">
              Phone
            </label>
            <input id="reporterPhone" name="reporterPhone" type="tel" autoComplete="tel" className="input" />
          </div>
          <div>
            <label htmlFor="reporterEmail" className="mb-1 block text-sm font-medium text-ink">
              Email
            </label>
            <input id="reporterEmail" name="reporterEmail" type="email" autoComplete="email" className="input" />
          </div>
        </div>
        <label className="flex items-start gap-3 text-sm text-ink">
          <input type="checkbox" name="wantsContact" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Please ask the Safeguarding Lead to contact me.</span>
        </label>
      </fieldset>

      <p className="text-sm text-ink-muted">
        Only our Safeguarding Lead and the people who need to act on this will see it. We keep it securely and may share
        it with children&apos;s social care, the police or other agencies where that is needed to protect a child. See our{' '}
        <Link href="/privacy-policy" className="font-medium text-brand-600 underline hover:text-brand-700">
          Privacy Policy
        </Link>
        .
      </p>

      {state.status === 'error' && (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : 'Send to our Safeguarding Lead'}
      </button>
    </form>
  )
}
