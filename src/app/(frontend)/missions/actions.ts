'use server'

import { getPayloadClient } from '@/lib/payload'

export type MissionFormState = { status: 'idle' | 'success' | 'error'; message?: string }

function isSpam(formData: FormData): boolean {
  return String(formData.get('website') || '').length > 0
}

export async function submitMissionSignup(
  _prev: MissionFormState,
  formData: FormData,
): Promise<MissionFormState> {
  const successMessage = 'Thank you — our Missions team will be in touch about the next steps.'

  if (isSpam(formData)) {
    return { status: 'success', message: successMessage }
  }

  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  if (!name || !email) {
    return { status: 'error', message: 'Please enter your name and email.' }
  }

  const project = formData.get('interestedProject')
  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'form-submissions',
      data: {
        formType: 'mission-trip',
        name,
        email,
        phone: formData.get('phone') ? String(formData.get('phone')) : undefined,
        // Empty = "any project / not sure yet".
        interestedProject: project ? Number(project) : undefined,
        message: formData.get('message') ? String(formData.get('message')) : undefined,
      },
    })
    return { status: 'success', message: successMessage }
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}
