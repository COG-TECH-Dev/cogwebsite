import type { CollectionAfterChangeHook } from 'payload'

/**
 * Tells the Safeguarding Lead that a concern has arrived. Email isn't a secure
 * channel, so the message carries NO details — only a reference and a link to
 * the admin, where access is restricted. A failed email must never lose the
 * record, so errors are logged and swallowed.
 */
export const notifySafeguardingLead: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  try {
    const settings = await req.payload.findGlobal({ slug: 'settings' })
    const to = settings.safeguarding?.alertEmail || settings.safeguarding?.leadEmail || process.env.NOTIFY_EMAIL
    if (!to) return doc
    const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || ''
    const urgent = doc.immediateDanger ? 'URGENT: ' : ''
    await req.payload.sendEmail({
      to,
      subject: `${urgent}New safeguarding concern logged (${doc.reference})`,
      text:
        `A new safeguarding concern has been logged (reference ${doc.reference}).\n\n` +
        `Please sign in to the admin to read it${base ? `: ${base}/admin/collections/safeguarding-concerns/${doc.id}` : '.'}\n\n` +
        (doc.immediateDanger ? 'The sender said a child may be in immediate danger. Act on this straight away.\n\n' : '') +
        'For security, the details of the concern are not included in this email.',
    })
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Could not email the Safeguarding Lead about a new concern' })
  }
  return doc
}
