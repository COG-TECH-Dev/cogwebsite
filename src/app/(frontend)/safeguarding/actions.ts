'use server'

import { getPayloadClient } from '@/lib/payload'
import type { SafeguardingConcern } from '@/payload-types'

export type ConcernState = { status: 'idle' | 'success' | 'error'; message?: string; reference?: string }

const URGENT = 'If a child is in danger right now, call 999.'

// Same hidden-field trap the other forms use; a bot gets a believable "success".
function isSpam(formData: FormData): boolean {
  return String(formData.get('website') || '').length > 0
}

const clip = (value: FormDataEntryValue | null, max: number) => String(value ?? '').trim().slice(0, max)

const RELATIONSHIPS: NonNullable<NonNullable<SafeguardingConcern['reporter']>['relationship']>[] = [
  'member',
  'parent',
  'volunteer',
  'visitor',
  'child',
  'other',
]

export async function submitSafeguardingConcern(_prev: ConcernState, formData: FormData): Promise<ConcernState> {
  if (isSpam(formData)) {
    return { status: 'success', message: `Thank you for speaking up. ${URGENT}` }
  }

  const payload = await getPayloadClient()

  // The page and form stay off until the church has reviewed them and named a
  // Safeguarding Lead (Settings > Safeguarding), so nothing can arrive unread.
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  if (!settings?.safeguarding?.enabled) {
    return { status: 'error', message: `This form is not available right now. ${URGENT} Otherwise please phone the church office.` }
  }

  const concern = clip(formData.get('concern'), 5000)
  if (!concern) {
    return { status: 'error', message: 'Please tell us what you are worried about, in your own words.' }
  }

  const relationship = String(formData.get('relationship') || '') as (typeof RELATIONSHIPS)[number]

  try {
    const created = await payload.create({
      collection: 'safeguarding-concerns',
      data: {
        status: 'new',
        concern,
        whenAndWhere: clip(formData.get('whenAndWhere'), 300) || undefined,
        childName: clip(formData.get('childName'), 200) || undefined,
        childAgeOrDob: clip(formData.get('childAgeOrDob'), 100) || undefined,
        othersTold: clip(formData.get('othersTold'), 3000) || undefined,
        immediateDanger: formData.get('immediateDanger') === 'on',
        involvesStaffOrVolunteer: formData.get('involvesStaffOrVolunteer') === 'on',
        reporter: {
          name: clip(formData.get('reporterName'), 200) || undefined,
          relationship: RELATIONSHIPS.includes(relationship) ? relationship : undefined,
          phone: clip(formData.get('reporterPhone'), 60) || undefined,
          email: clip(formData.get('reporterEmail'), 200) || undefined,
          wantsContact: formData.get('wantsContact') === 'on',
        },
      },
    })
    return {
      status: 'success',
      reference: created.reference ?? undefined,
      message: `Thank you for speaking up. Our Safeguarding Lead has been told and will read this as soon as possible. ${URGENT}`,
    }
  } catch {
    return {
      status: 'error',
      message: `Something went wrong and your message may not have reached us. ${URGENT} Otherwise please phone the church office, or try again.`,
    }
  }
}
