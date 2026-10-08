export const ROLES = [
  'super-admin',
  'admin',
  'content-editor',
  'ministry-leader',
  'welfare-team',
  'volunteer',
] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  'super-admin': 'Super Admin',
  admin: 'Admin / Pastor',
  'content-editor': 'Content Editor',
  'ministry-leader': 'Ministry Leader',
  'welfare-team': 'Welfare Team',
  volunteer: 'Volunteer',
}

export const ROLE_OPTIONS = ROLES.map((value) => ({ label: ROLE_LABELS[value], value }))
