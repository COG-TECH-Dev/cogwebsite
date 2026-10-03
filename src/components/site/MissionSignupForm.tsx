'use client'

import { useActionState } from 'react'

import { submitMissionSignup, type MissionFormState } from '@/app/(frontend)/missions/actions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: MissionFormState = { status: 'idle' }

export function MissionSignupForm({ projects }: { projects: { id: number; title: string }[] }) {
  const [state, formAction, pending] = useActionState(submitMissionSignup, initialState)

  if (state.status === 'success') {
    return <p className="rounded-xl bg-brand-50 p-6 text-brand-700">{state.message}</p>
  }

  return (
    <form action={formAction} className="space-y-5">
      <Honeypot />
      {projects.length > 0 && (
        <div>
          <label htmlFor="ms-project" className="mb-1 block text-sm font-medium text-ink">
            Which project interests you?
          </label>
          <select id="ms-project" name="interestedProject" className="input" defaultValue="">
            <option value="">Any / not sure yet</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ms-name" className="mb-1 block text-sm font-medium text-ink">
            Name
          </label>
          <input id="ms-name" name="name" type="text" required className="input" />
        </div>
        <div>
          <label htmlFor="ms-email" className="mb-1 block text-sm font-medium text-ink">
            Email
          </label>
          <input id="ms-email" name="email" type="email" required className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="ms-phone" className="mb-1 block text-sm font-medium text-ink">
          Phone (optional)
        </label>
        <input id="ms-phone" name="phone" type="tel" className="input" />
      </div>
      <div>
        <label htmlFor="ms-message" className="mb-1 block text-sm font-medium text-ink">
          Tell us a little about yourself and how you&apos;d like to help (optional)
        </label>
        <textarea id="ms-message" name="message" rows={3} className="input" />
      </div>
      <ConsentNotice />
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : 'Sign Me Up'}
      </button>
    </form>
  )
}
