import type { FieldHook } from 'payload'

// Turns arbitrary text into a URL-safe slug: lowercase, alphanumeric words
// joined by single hyphens, no leading/trailing hyphens.
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// A `slug` field left blank by a non-technical editor copies the title
// as-is (spaces, capitals and all), which produces a URL nobody can reach —
// e.g. "/programmes/My%20Event" 404s where "/programmes/my-event" would
// have worked. This normalizes whatever's in the slug field on every save
// (auto-filling from `sourceField` when it's empty), so a broken slug also
// self-heals the next time the document is saved.
export const formatSlug = (sourceField: string): FieldHook => ({ value, data, originalDoc }) => {
  const source =
    typeof value === 'string' && value.length > 0
      ? value
      : (data?.[sourceField] ?? originalDoc?.[sourceField])

  if (typeof source === 'string' && source.length > 0) {
    return slugify(source)
  }

  return value
}
