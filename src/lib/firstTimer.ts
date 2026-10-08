/**
 * The first-time visitor form mirrors the church's own "New Member" Google Form,
 * so the same questions (and answers) are used by the form, the saved record and
 * the email to the welcome team. Keep the values in step with the select fields in
 * src/collections/FormSubmissions.ts.
 */

// Where first-time visitor forms are emailed unless Settings says otherwise.
export const DEFAULT_FIRST_TIMER_EMAIL = 'vip@cityofgodchristiancentre.org'

// The wording is the New Member form's own, so the welcome team recognises every question and answer.
export const VISITOR_TYPES = [
  { value: 'student', label: 'Student' },
  { value: 'working-professional', label: 'Working Professional' },
  { value: 'visitor', label: 'Visitor' },
  { value: 'other', label: 'Others' },
] as const

export const VISITOR_INTENTS = [
  { value: 'accept-jesus', label: 'I want to Accept Jesus as my Lord and Saviour' },
  { value: 'membership', label: 'I want to be a member' },
  { value: 'join-department', label: 'I want to join a department in church' },
] as const

export const CONTACT_PREFERENCES = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'other', label: 'Other' },
] as const

export const labelFor = (list: readonly { value: string; label: string }[], value: unknown): string | undefined =>
  list.find((o) => o.value === value)?.label
