// What the Children's Ministry page shows until the team enters their own in the admin
// (Ministries > Children's Ministry). The classes and ages are the church's own; the Sunday
// times are the ones already published on the "I'm New Here" page. The descriptions are
// standard wording for each age group, using the stages UK parents know from school
// (Early Years, Key Stage 1 and 2, Year 7), for the children's team to confirm or replace.

export const DEFAULT_CLASSES: { name: string; ageRange: string; description: string }[] = [
  {
    name: 'Pearls',
    ageRange: 'Under 3 years',
    description:
      'For babies and toddlers (Early Years). Gentle, play-based care with songs, simple stories and sensory play, in a calm, safe room while you worship.',
  },
  {
    name: 'Rubies',
    ageRange: '4–5 years',
    description:
      'For pre-school and Reception children (Early Years). Short, lively Bible stories with songs, actions, crafts and play, so children learn that God loves them in ways that suit short attention spans.',
  },
  {
    name: 'Diamond',
    ageRange: '6–8 years',
    description:
      'For Key Stage 1 and the start of Key Stage 2. Bible stories brought to life through drama, games and craft in small groups, with memory verses and learning to pray in their own words.',
  },
  {
    name: 'Gold',
    ageRange: '9–12 years',
    description:
      'For upper Key Stage 2 up to Year 7. Digging deeper into the Bible through discussion, quizzes and projects, asking big questions, building good friendships and serving others, ready to move on to Teens Ministry.',
  },
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
