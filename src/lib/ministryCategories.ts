// Groups for the ministry directory's filter. A ministry's category is whatever is chosen on
// it in the admin (Ministries > Category); until one is chosen, it is worked out from the
// ministry's name, the same way an icon is (see guessMinistryIcon), so the filter works
// without anyone having to set 15 categories first.

export const MINISTRY_CATEGORIES = [
  { value: 'children-youth', label: 'Children & youth' },
  { value: 'worship-arts', label: 'Worship & arts' },
  { value: 'fellowship-family', label: 'Fellowship & family' },
  { value: 'outreach-missions', label: 'Outreach & missions' },
  { value: 'prayer-care', label: 'Prayer & care' },
  { value: 'service-teams', label: 'Service teams' },
] as const

export type MinistryCategory = (typeof MINISTRY_CATEGORIES)[number]['value']

const KEYWORDS: [RegExp, MinistryCategory][] = [
  [/child|kid|youth|teen|ablaze|young/i, 'children-youth'],
  [/music|choir|worship|praise|drama|dance|arts?\b/i, 'worship-arts'],
  [/mission|outreach|evangel/i, 'outreach-missions'],
  [/prayer|intercess|welfare|benevolen|care\b|counsel/i, 'prayer-care'],
  [/\bwomen'?s?\b|\bmen'?s?\b|marriage|couple|family|singles?|seniors?/i, 'fellowship-family'],
  [/usher|protocol|hospitality|welcome|media|tech|sound|video|stream|security|transport/i, 'service-teams'],
]

const VALUES = new Set<string>(MINISTRY_CATEGORIES.map((c) => c.value))

/** The ministry's chosen category, or a best guess from its name, or null when neither applies. */
export function ministryCategory(m: { name: string; category?: string | null }): MinistryCategory | null {
  if (m.category && VALUES.has(m.category)) return m.category as MinistryCategory
  for (const [pattern, category] of KEYWORDS) {
    if (pattern.test(m.name)) return category
  }
  return null
}

export const isMinistryCategory = (value: unknown): value is MinistryCategory => typeof value === 'string' && VALUES.has(value)
