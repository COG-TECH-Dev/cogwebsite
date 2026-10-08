// Groups for the ministry directory's filter. A ministry's category is whatever is chosen on
// it in the admin (Ministries > Category); until one is chosen, it is worked out from the
// ministry's name, the same way an icon is (see guessMinistryIcon), so the filter works
// without anyone having to set 15 categories first.

// `words` are the everyday words people search with, so a search for "music" or "kids" finds the group.
export const MINISTRY_CATEGORIES = [
  { value: 'children-youth', label: 'Children & youth', words: 'children kids youth teens teenagers young people' },
  { value: 'worship-arts', label: 'Worship & arts', words: 'worship music singing songs choir praise drama dance arts' },
  { value: 'fellowship-family', label: 'Fellowship & family', words: 'fellowship family men women marriage couples' },
  { value: 'outreach-missions', label: 'Outreach & missions', words: 'outreach missions evangelism street' },
  { value: 'prayer-care', label: 'Prayer & care', words: 'prayer care welfare counselling support benevolence' },
  { value: 'service-teams', label: 'Service teams', words: 'service volunteer serving ushering welcome hospitality media sound technical' },
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

/** The text a search can match for a ministry's group: its name and the everyday words for it. */
export function categorySearchText(m: { name: string; category?: string | null }): string {
  const c = MINISTRY_CATEGORIES.find((x) => x.value === ministryCategory(m))
  return c ? `${c.label} ${c.words}` : ''
}

export const isMinistryCategory = (value: unknown): value is MinistryCategory => typeof value === 'string' && VALUES.has(value)
