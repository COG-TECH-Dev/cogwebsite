import type { CollectionAfterChangeHook } from 'payload'

/**
 * Emails the church office whenever a prayer request or contact/appointment/
 * membership form is submitted. Without SMTP configured (see payload.config
 * `email` adapter), Payload's built-in fallback just logs the email to the
 * console instead of sending — this hook works either way, no extra guard
 * needed.
 */
export const notifyOnSubmission = (subject: string, describe: (doc: Record<string, unknown>) => string) => {
  const afterChange: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
    if (operation !== 'create') return doc

    const to = process.env.NOTIFY_EMAIL
    if (!to) return doc

    await req.payload.sendEmail({
      to,
      subject,
      text: describe(doc),
    })

    return doc
  }
  return afterChange
}
