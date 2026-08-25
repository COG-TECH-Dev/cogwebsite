import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Payload runs embedded inside this Next.js app (same process), so
 * collection/global hooks can call `revalidatePath` directly — no separate
 * webhook/API route needed. Publishing content clears the relevant ISR
 * cache immediately instead of waiting out the `revalidate` window on each
 * page.
 */
export const revalidateCollection = (getPaths: (doc: Record<string, unknown>) => string[]) => {
  const afterChange: CollectionAfterChangeHook = ({ doc }) => {
    for (const path of getPaths(doc)) revalidatePath(path)
    return doc
  }
  return afterChange
}

export const revalidateCollectionOnDelete = (getPaths: (doc: Record<string, unknown>) => string[]) => {
  const afterDelete: CollectionAfterDeleteHook = ({ doc }) => {
    for (const path of getPaths(doc)) revalidatePath(path)
    return doc
  }
  return afterDelete
}

export const revalidateGlobal = (paths: string[]) => {
  const afterChange: GlobalAfterChangeHook = ({ doc }) => {
    for (const path of paths) revalidatePath(path, 'layout')
    return doc
  }
  return afterChange
}
