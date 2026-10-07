import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

type Doc = Record<string, unknown>

/**
 * Emails the church office whenever a prayer request or contact/appointment/
 * membership form is submitted. Without RESEND_API_KEY configured (see
 * payload.config `email` adapter), Payload's built-in fallback just logs the
 * email to the console instead of sending — this hook works either way, no
 * extra guard needed.
 *
 * By default the email goes to NOTIFY_EMAIL. A form that has its own team can
 * pass `resolveTo` to choose the recipient(s) instead (and may return nothing to
 * send no email). A failing email never loses the submission: it is saved first,
 * and a sending problem (an unverified domain, a bad key) is only logged.
 */
export const notifyOnSubmission = (
  subject: string | ((doc: Doc, req: PayloadRequest) => string | Promise<string>),
  describe: (doc: Doc, req: PayloadRequest) => string | Promise<string>,
  resolveTo?: (doc: Doc, req: PayloadRequest) => string | string[] | null | undefined | Promise<string | string[] | null | undefined>,
) => {
  const afterChange: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
    if (operation !== 'create') return doc

    const to = resolveTo ? await resolveTo(doc, req) : process.env.NOTIFY_EMAIL
    if (!to || (Array.isArray(to) && to.length === 0)) return doc

    try {
      await req.payload.sendEmail({
        to,
        subject: typeof subject === 'function' ? await subject(doc, req) : subject,
        text: await describe(doc, req),
      })
    } catch (err) {
      req.payload.logger.error({ err }, 'Could not send the form notification email; the submission itself was saved.')
    }

    return doc
  }
  return afterChange
}
