import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Forces a Volunteer's submission back to draft status even if they try to
 * publish directly. Pairs with `versions.drafts` on a collection to
 * implement "Volunteer can create/edit drafts, but only Content Editor and
 * above can publish." Ministry Leaders and above are unaffected — within
 * their own access scope they can publish normally.
 */
export const restrictPublishToContentEditor: CollectionBeforeChangeHook = ({ data, req }) => {
  if (req.user?.role === 'volunteer' && data._status === 'published') {
    return { ...data, _status: 'draft' }
  }
  return data
}
