import type { CollectionConfig } from 'payload'

import { isAdminOrUp, isAdminOrUpField, isSuperAdmin } from '../access'
import { ROLE_OPTIONS } from '../access/roles'
import { getSiteUrl } from '../lib/siteUrl'

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * The reset email's link is built from the site's own address. Payload's own wording works the link out from the incoming
 * request, which on the live site arrives with no address, so the email carried a bare "/admin/reset/..." that cannot be opened.
 */
function resetPasswordEmail({ token, user, adminPath }: { token?: string; user?: { name?: string | null }; adminPath: string }) {
  const link = `${getSiteUrl()}${adminPath}/${token}`
  const greeting = user?.name ? `Hello ${escapeHtml(user.name)},` : 'Hello,'
  return `<p>${greeting}</p>
<p>Someone (hopefully you) asked to reset the password for your City of God Christian Centre website account. To choose a new password, open this link within the next hour:</p>
<p><a href="${link}" style="display:inline-block;padding:10px 20px;background:#d4a017;color:#0b2a30;font-weight:600;text-decoration:none;border-radius:999px">Choose a new password</a></p>
<p>Or copy this address into your browser:<br><a href="${link}">${link}</a></p>
<p>If you did not ask for this, ignore this email and your password stays as it is.</p>`
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'People & Enquiries',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: {
    forgotPassword: {
      generateEmailSubject: () => 'Reset your City of God website password',
      generateEmailHTML: (args) =>
        resetPasswordEmail({
          token: args?.token,
          user: args?.user,
          adminPath: `${args?.req?.payload.config.routes.admin ?? '/admin'}${args?.req?.payload.config.admin.routes.reset ?? '/reset'}`,
        }),
    },
  },
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
    {
      name: 'ministries',
      type: 'relationship',
      relationTo: 'ministries',
      hasMany: true,
      access: {
        // Only Admin+ decides which ministries a Ministry Leader manages.
        update: isAdminOrUpField,
      },
      admin: {
        description: 'For Ministry Leaders: which ministry/ministries this person manages.',
        condition: (data) => data.role === 'ministry-leader',
      },
    },
  ],
  versions: false,
}
