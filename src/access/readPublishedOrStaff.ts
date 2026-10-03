import type { Access } from 'payload'

// For collections with drafts: signed-in staff see everything (drafts too, so
// the admin panel works); everyone else — including the public REST API — only
// sees published documents. A bare `read: () => true` would let anyone fetch
// unpublished drafts.
export const readPublishedOrStaff: Access = ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } })
