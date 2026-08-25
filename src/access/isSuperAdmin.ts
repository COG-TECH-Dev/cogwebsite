import type { Access, FieldAccess } from 'payload'

export const isSuperAdmin: Access = ({ req: { user } }) => user?.role === 'super-admin'

export const isSuperAdminField: FieldAccess = ({ req: { user } }) => user?.role === 'super-admin'
