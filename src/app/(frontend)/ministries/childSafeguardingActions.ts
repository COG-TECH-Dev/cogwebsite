'use server'

import { getPayloadClient } from '@/lib/payload'
import type { ChildSafeguardingForm } from '@/payload-types'

export type ChildFormState = { status: 'idle' | 'success' | 'error'; message?: string }

function isSpam(formData: FormData): boolean {
  return String(formData.get('website') || '').length > 0
}

const VALID_TYPES = ['photo-consent', 'volunteer-interest', 'pre-registration']

export async function submitChildSafeguardingForm(_prev: ChildFormState, formData: FormData): Promise<ChildFormState> {
  const successMessage = "Thank you — our Children's Ministry team will be in touch."

  if (isSpam(formData)) {
    return { status: 'success', message: successMessage }
  }

  const formType = String(formData.get('formType') || '') as ChildSafeguardingForm['formType']
  if (!VALID_TYPES.includes(formType)) {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }

  const parentName = String(formData.get('parentName') || '').trim()
  const parentEmail = String(formData.get('parentEmail') || '').trim()
  if (!parentName || !parentEmail) {
    return { status: 'error', message: 'Please enter your name and email.' }
  }

  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'child-safeguarding-forms',
      data: {
        formType,
        parentName,
        parentEmail,
        parentPhone: formData.get('parentPhone') ? String(formData.get('parentPhone')) : undefined,
        childName: formData.get('childName') ? String(formData.get('childName')) : undefined,
        childDOB: formData.get('childDOB') ? String(formData.get('childDOB')) : undefined,
        photoConsent: (formData.get('photoConsent') as ChildSafeguardingForm['photoConsent']) || undefined,
        allergiesOrMedicalNotes: formData.get('allergiesOrMedicalNotes')
          ? String(formData.get('allergiesOrMedicalNotes'))
          : undefined,
        additionalNeeds: formData.get('additionalNeeds') ? String(formData.get('additionalNeeds')) : undefined,
        authorisedCollectors: formData.get('authorisedCollectors')
          ? String(formData.get('authorisedCollectors'))
          : undefined,
        medicalTreatmentConsent: formData.get('medicalTreatmentConsent') === 'on',
        emergencyContactName: formData.get('emergencyContactName')
          ? String(formData.get('emergencyContactName'))
          : undefined,
        emergencyContactPhone: formData.get('emergencyContactPhone')
          ? String(formData.get('emergencyContactPhone'))
          : undefined,
        availability: formData.get('availability') ? String(formData.get('availability')) : undefined,
        vettingAcknowledged: formData.get('vettingAcknowledged') === 'on',
        message: formData.get('message') ? String(formData.get('message')) : undefined,
      },
    })
    return { status: 'success', message: successMessage }
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}
