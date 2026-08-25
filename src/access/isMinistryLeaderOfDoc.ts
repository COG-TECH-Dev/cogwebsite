import type { Access } from 'payload'

import { isContentEditorOrUp } from './isContentEditorOrUp'

/**
 * Factory for scoping a collection to the requesting user's own ministries.
 * Content Editor and above bypass the scoping (they already have full
 * access via the collection's own access config). A Ministry Leader only
 * ever sees/edits documents whose `relationField` matches one of the
 * ministries assigned to them on their user record.
 *
 * Not wired into any collection yet — the `ministries` relationship field on
 * Users, and the collections it scopes (Ministries, Events, gallery items),
 * land in Phase 2. Kept here now so the RBAC pattern for every later
 * collection is decided once, in one place.
 */
export const isMinistryLeaderOfDoc = (relationField: string): Access => {
  return (args) => {
    const { req } = args
    const user = req.user

    if (!user) return false
    if (isContentEditorOrUp(args)) return true
    if (user.role !== 'ministry-leader') return false

    const ministryIds = (user.ministries ?? []).map((m) => (typeof m === 'number' ? m : m.id))

    if (ministryIds.length === 0) return false

    return {
      [relationField]: {
        in: ministryIds,
      },
    }
  }
}
