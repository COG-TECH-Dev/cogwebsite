import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Payload runs embedded inside this Next.js app (same process), so
 * collection/global hooks can call `revalidatePath` directly — no separate
 * webhook/API route needed. Publishing content clears the relevant ISR
 * cache immediately instead of waiting out the `revalidate` window on each
 * page.
 *
 * `revalidatePath` only works inside an actual Next.js request (it reads
 * Next's internal request store) — it throws when the Local API is used
 * from a standalone script (a seed/import script, a one-off cron job run
 * via `tsx`/`node` rather than through the app). That's not a bug in the
 * calling code, so swallow it here rather than let a content update fail
 * outright just because on-demand revalidation couldn't run; the page will
 * still refresh on its own once the ISR window elapses.
 */
const safeRevalidatePath: typeof revalidatePath = (...args) => {
  try {
    revalidatePath(...args)
  } catch {
    // no-op — see comment above
  }
}

export const revalidateCollection = (getPaths: (doc: Record<string, unknown>) => string[]) => {
  const afterChange: CollectionAfterChangeHook = ({ doc }) => {
    for (const path of getPaths(doc)) safeRevalidatePath(path)
    return doc
  }
  return afterChange
}

export const revalidateCollectionOnDelete = (getPaths: (doc: Record<string, unknown>) => string[]) => {
  const afterDelete: CollectionAfterDeleteHook = ({ doc }) => {
    for (const path of getPaths(doc)) safeRevalidatePath(path)
    return doc
  }
  return afterDelete
}

export const revalidateGlobal = (paths: string[]) => {
  const afterChange: GlobalAfterChangeHook = ({ doc }) => {
    for (const path of paths) safeRevalidatePath(path, 'layout')
    return doc
  }
  return afterChange
}
