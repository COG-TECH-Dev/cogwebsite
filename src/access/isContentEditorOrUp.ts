import type { Access, FieldAccess } from 'payload'

const ALLOWED = new Set(['super-admin', 'admin', 'content-editor'])

const check = (role?: string | null) => Boolean(role && ALLOWED.has(role))

export const isContentEditorOrUp: Access = ({ req: { user } }) => check(user?.role)

export const isContentEditorOrUpField: FieldAccess = ({ req: { user } }) => check(user?.role)
