import { Phone, ShieldPlus } from 'lucide-react'

import { getPayloadClient } from '@/lib/payload'

/**
 * "Duty pastor this week" notice. Shows nothing unless an admin has filled in
 * Settings → Duty Pastor and ticked "Show on the website" — so no contact
 * details are ever published by accident.
 */
export async function DutyPastorCard({ className = '' }: { className?: string }) {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const duty = settings?.dutyPastor
  if (!duty?.show || !duty.name) return null

  return (
    <div className={`rounded-2xl border border-gold-300 bg-gold-100/60 p-5 ${className}`}>
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-700">
        <ShieldPlus className="h-4 w-4" aria-hidden="true" />
        Duty Pastor This Week
      </p>
      <p className="mt-2 font-serif text-xl font-semibold text-brand-700">{duty.name}</p>
      {duty.note && <p className="mt-1 text-sm text-ink-muted">{duty.note}</p>}
      {duty.phone && (
        <a
          href={`tel:${duty.phone}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {duty.phone}
        </a>
      )}
    </div>
  )
}
