import type { Where } from 'payload'

// Public pages must add this to their queries: Payload's server-side (Local)
// API skips access rules by default, so without it a document that was only
// ever saved as a draft would still show up on the website.
export const publishedOnly: Where = { _status: { equals: 'published' } }
