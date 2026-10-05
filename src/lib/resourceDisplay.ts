// How each kind of resource is named and pictured, shared by the Resources hub and the resource page.

export const TYPE_LABELS: Record<string, string> = {
  'start-here': 'Start Here',
  devotional: 'Devotional',
  'reading-plan': 'Bible Reading Plan',
  'topical-guide': 'Topical Guide',
  ebook: 'E-book',
  'ministry-form': 'Ministry Form',
}

export const TYPE_ICONS: Record<string, string> = {
  'start-here': 'compass',
  devotional: 'sun',
  'reading-plan': 'book',
  'topical-guide': 'lightbulb',
  ebook: 'book',
  'ministry-form': 'scroll',
}

// The filter tabs on the hub, in order. A tab only shows once something of that kind exists.
export const FILTERS: { label: string; value: string }[] = [
  { label: 'Start Here', value: 'start-here' },
  { label: 'Devotionals', value: 'devotional' },
  { label: 'Reading Plans', value: 'reading-plan' },
  { label: 'Topical Guides', value: 'topical-guide' },
  { label: 'E-books', value: 'ebook' },
  { label: 'Ministry Forms', value: 'ministry-form' },
]
