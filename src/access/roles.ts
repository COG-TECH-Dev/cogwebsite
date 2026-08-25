export const ROLES = [
  'super-admin',
  'admin',
  'content-editor',
  'ministry-leader',
  'volunteer',
] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  'super-admin': 'Super Admin',
  admin: 'Admin / Pastor',
  'content-editor': 'Content Editor',
  'ministry-leader': 'Ministry Leader',
  volunteer: 'Volunteer',
}

export const ROLE_OPTIONS = ROLES.map((value) => ({ label: ROLE_LABELS[value], value }))
