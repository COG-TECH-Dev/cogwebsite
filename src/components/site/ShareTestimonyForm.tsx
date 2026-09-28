'use client'

import { useActionState } from 'react'

import { submitTestimony, type FormState } from '@/app/(frontend)/connect/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }

export function ShareTestimonyForm({ ministries }: { ministries?: { id: number; name: string }[] }) {
  const [state, formAction, pending] = useActionState(submitTestimony, initialState)

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
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          Email (optional — for follow-up only, never shown publicly)
        </label>
        <input id="email" name="email" type="email" className="input" />
      </div>
      {ministries && ministries.length > 0 && (
        <div>
          <label htmlFor="relatedMinistry" className="mb-1 block text-sm font-medium text-ink">
            Which ministry is this about? (optional)
          </label>
          <select id="relatedMinistry" name="relatedMinistry" className="input" defaultValue="">
            <option value="">Not specific to a ministry</option>
            {ministries.map((ministry) => (
              <option key={ministry.id} value={ministry.id}>
                {ministry.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="quote" className="mb-1 block text-sm font-medium text-ink">
          Your Testimony
        </label>
        <textarea
          id="quote"
          name="quote"
          required
          rows={6}
          placeholder="Share what God has done in your life…"
          className="input"
        />
      </div>
      <p className="text-xs text-ink-muted">
        Our team reviews every testimony before it&apos;s shared publicly on the site.
      </p>
      <ConsentNotice />
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : 'Share My Testimony'}
      </button>
    </form>
  )
}
