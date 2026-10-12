/**
 * The first-time visitor form mirrors the church's own "New Member" Google Form,
 * so the same questions (and answers) are used by the form, the saved record and
 * the email to the welcome team. Keep the values in step with the select fields in
 * src/collections/FormSubmissions.ts.
 */

// Where first-time visitor forms are emailed unless Settings says otherwise.
export const DEFAULT_FIRST_TIMER_EMAIL = 'vip@cityofgodchristiancentre.org'

// Each church's own welcome-team inbox. A form goes to the church the visitor says they visited. London and Middlesbrough
// have none yet, so theirs go to the general address above until one is added (here, or under Settings > Form emails).
export const BRANCH_FIRST_TIMER_EMAILS: Record<string, string> = {
  'Newcastle Church': 'vip@cityofgodchristiancentre.org',
  'Sunderland Church': 'vipsunderland@cityofgodchristiancentre.org',
  'Gateshead Church': 'gateshead@cityofgodchristiancentre.org',
}

type FirstTimerEmailSettings = {
  formEmails?: { firstTimer?: string | null; firstTimerBranches?: { branch: string; email: string }[] | null } | null
} | null

/**
 * Who a first-time visitor's form is emailed to: the address set for their church under Settings, else the built-in one
 * for that church, else the general first-time-visitor address from Settings, else the default.
 */
export function firstTimerRecipient(campus: string | null | undefined, settings: FirstTimerEmailSettings): string {
  const church = campus?.trim()
  const fromSettings = church ? settings?.formEmails?.firstTimerBranches?.find((b) => b.branch === church)?.email?.trim() : undefined
  return (
    fromSettings ||
    (church ? BRANCH_FIRST_TIMER_EMAILS[church] : undefined) ||
    settings?.formEmails?.firstTimer?.trim() ||
    DEFAULT_FIRST_TIMER_EMAIL
  )
}

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

// The choices for "How did you hear about us". The value saved is the same word, so the Analytics page can count them.
export const HOW_HEARD = ['Instagram', 'Facebook', 'X (Twitter)', 'Evangelism', 'TikTok', 'Church Flyer', 'YouTube', 'Other'] as const

export const CONTACT_PREFERENCES = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'other', label: 'Other' },
] as const

export const labelFor = (list: readonly { value: string; label: string }[], value: unknown): string | undefined =>
  list.find((o) => o.value === value)?.label
