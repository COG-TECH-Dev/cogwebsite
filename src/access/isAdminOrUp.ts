import type { Access, FieldAccess } from 'payload'

const check = (role?: string | null) => role === 'super-admin' || role === 'admin'

export const isAdminOrUp: Access = ({ req: { user } }) => check(user?.role)

export const isAdminOrUpField: FieldAccess = ({ req: { user } }) => check(user?.role)
