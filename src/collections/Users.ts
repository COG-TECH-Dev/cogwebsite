import type { CollectionConfig } from 'payload'

import { isAdminOrUp, isAdminOrUpField, isSuperAdmin } from '../access'
import { ROLE_OPTIONS } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'People & Enquiries',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: true,
  access: {
    // Logged-in users can be listed (e.g. for "assigned to" relationship
    // fields); only Admin+ can create/update, only Super Admin can delete.
    read: ({ req: { user } }) => Boolean(user),
    create: isAdminOrUp,
    update: isAdminOrUp,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'volunteer',
      options: ROLE_OPTIONS,
      access: {
        // Only Super Admin / Admin can assign or change roles, so nobody
        // can self-promote by editing their own profile.
        update: isAdminOrUpField,
      },
      admin: {
        description: 'Controls what this person can see and edit in the admin panel.',
      },
    },
    // Email + password fields are added automatically by `auth: true`.
    // A `ministries` relationship (for scoping Ministry Leader access) is
    // added in Phase 2 once the Ministries collection exists.
  ],
  versions: false,
}
