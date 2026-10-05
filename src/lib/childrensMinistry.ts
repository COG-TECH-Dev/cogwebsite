// What the Children's Ministry page shows until the team enters their own in the admin
// (Ministries > Children's Ministry). The classes are the church's own; the Sunday times
// are the ones already published on the "I'm New Here" page.

export const DEFAULT_CLASSES: { name: string; ageRange: string; description: string }[] = [
  { name: 'Pearls', ageRange: 'Under 3 years', description: '' },
  { name: 'Rubies', ageRange: '4–5 years', description: '' },
  { name: 'Diamond', ageRange: '6–8 years', description: '' },
  { name: 'Gold', ageRange: '9–12 years', description: '' },
]

export const DEFAULT_SCHEDULE: { label: string; time: string }[] = [
  { label: 'Sunday school', time: 'From 10:40am' },
  { label: "Children's service", time: '11:00am, Church Community Hall' },
]

// A little colour per class, to match the kid-friendly look of the page.
export function classColours(name: string): { bar: string; badge: string } {
  const n = name.toLowerCase()
  if (n.includes('pearl')) return { bar: 'bg-slate-300', badge: 'bg-slate-100 text-slate-700' }
  if (n.includes('ruby') || n.includes('rubies')) return { bar: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700' }
  if (n.includes('diamond')) return { bar: 'bg-sky-500', badge: 'bg-sky-100 text-sky-700' }
  if (n.includes('gold')) return { bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800' }
  return { bar: 'bg-brand-500', badge: 'bg-brand-50 text-brand-700' }
}
