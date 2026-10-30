/**
 * The kinds of letter the Reference Letter form offers. One list is used by the form, by the server check on a submission,
 * by the admin field and by the email to the office. Keep the values in step with the letterType select in
 * src/collections/FormSubmissions.ts (which uses this list).
 */
export const LETTER_TYPES = [
  { value: 'character', label: 'Character Reference' },
  { value: 'membership-confirmation', label: 'Membership Confirmation' },
  { value: 'financial', label: 'Financial Reference' },
  { value: 'school', label: 'Letter for School' },
  { value: 'other', label: 'Other' },
] as const

export type LetterType = (typeof LETTER_TYPES)[number]['value']

export const isLetterType = (value: unknown): value is LetterType => LETTER_TYPES.some((t) => t.value === value)
