'use client'

import { useActionState, useState } from 'react'

import {
  submitChildSafeguardingForm,
  type ChildFormState,
} from '@/app/(frontend)/ministries/childSafeguardingActions'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: ChildFormState = { status: 'idle' }

const TABS = [
  { value: 'photo-consent', label: 'Photo/Media Consent' },
  { value: 'volunteer-interest', label: 'Volunteer Interest' },
  { value: 'pre-registration', label: 'Pre-Register My Child' },
] as const

export function ChildrenMinistryForms() {
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('photo-consent')
  const [state, formAction, pending] = useActionState(submitChildSafeguardingForm, initialState)

  if (state.status === 'success') {
    return <p className="rounded-2xl bg-white p-6 text-emerald-800">{state.message}</p>
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.value ? 'bg-white text-orange-700' : 'bg-white/40 text-white hover:bg-white/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form action={formAction} className="space-y-5 rounded-2xl bg-white p-6 sm:p-8">
        <Honeypot />
        <input type="hidden" name="formType" value={tab} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="parentName" className="mb-1 block text-sm font-medium text-ink">
              Parent/Guardian Name
            </label>
            <input id="parentName" name="parentName" type="text" required className="input" />
          </div>
          <div>
            <label htmlFor="parentEmail" className="mb-1 block text-sm font-medium text-ink">
              Email
            </label>
            <input id="parentEmail" name="parentEmail" type="email" required className="input" />
          </div>
        </div>
        <div>
          <label htmlFor="parentPhone" className="mb-1 block text-sm font-medium text-ink">
            Phone (optional)
          </label>
          <input id="parentPhone" name="parentPhone" type="tel" className="input" />
        </div>

        {(tab === 'photo-consent' || tab === 'pre-registration') && (
          <div>
            <label htmlFor="childName" className="mb-1 block text-sm font-medium text-ink">
              Child&apos;s Name
            </label>
            <input id="childName" name="childName" type="text" required className="input" />
          </div>
        )}

        {tab === 'photo-consent' && (
          <div>
            <p className="mb-2 text-sm font-medium text-ink">
              Do you consent to photos/video of your child being used by City of God Christian Centre for church
              publications, social media, and promotional materials? You can withdraw this consent at any time by
              contacting the church office.
            </p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="photoConsent" value="consent" required className="h-4 w-4" />I consent
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="photoConsent" value="decline" required className="h-4 w-4" />I do not
                consent
              </label>
            </div>
          </div>
        )}

        {tab === 'pre-registration' && (
          <>
            <div>
              <label htmlFor="childDOB" className="mb-1 block text-sm font-medium text-ink">
                Child&apos;s Date of Birth
              </label>
              <input id="childDOB" name="childDOB" type="date" required className="input" />
            </div>
            <div>
              <label htmlFor="allergiesOrMedicalNotes" className="mb-1 block text-sm font-medium text-ink">
                Allergies or Medical Notes
              </label>
              <textarea id="allergiesOrMedicalNotes" name="allergiesOrMedicalNotes" rows={3} className="input" />
            </div>
            <div>
              <label htmlFor="additionalNeeds" className="mb-1 block text-sm font-medium text-ink">
                Additional needs or anything that helps us support your child (optional)
              </label>
              <textarea id="additionalNeeds" name="additionalNeeds" rows={3} className="input" />
            </div>
            <div>
              <label htmlFor="authorisedCollectors" className="mb-1 block text-sm font-medium text-ink">
                Who may collect your child?
              </label>
              <p className="mb-2 text-sm text-ink-muted">
                Names of the adults allowed to collect your child. Our team will only hand your child to someone on
                this list.
              </p>
              <textarea id="authorisedCollectors" name="authorisedCollectors" rows={2} required className="input" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="emergencyContactName" className="mb-1 block text-sm font-medium text-ink">
                  Emergency Contact Name
                </label>
                <input id="emergencyContactName" name="emergencyContactName" type="text" required className="input" />
              </div>
              <div>
                <label htmlFor="emergencyContactPhone" className="mb-1 block text-sm font-medium text-ink">
                  Emergency Contact Phone
                </label>
                <input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  type="tel"
                  required
                  className="input"
                />
              </div>
            </div>
          </>
        )}

        {tab === 'pre-registration' && (
          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="medicalTreatmentConsent"
              required
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
            />
            If my child needs first aid or urgent medical treatment and the team cannot reach me straight away, I give
            permission for a leader to arrange it. I understand I will be contacted as soon as possible.
          </label>
        )}

        {tab === 'volunteer-interest' && (
          <>
            <div>
              <label htmlFor="availability" className="mb-1 block text-sm font-medium text-ink">
                When are you available to help?
              </label>
              <input id="availability" name="availability" type="text" placeholder="e.g. Sunday mornings" className="input" />
            </div>
            <label className="flex items-start gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="vettingAcknowledged"
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
              />
              I understand a DBS (background) check and reference check are required before I can serve with
              children.
            </label>
          </>
        )}

        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">
            Anything else we should know? (optional)
          </label>
          <textarea id="message" name="message" rows={3} className="input" />
        </div>

        <ConsentNotice />
        {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
