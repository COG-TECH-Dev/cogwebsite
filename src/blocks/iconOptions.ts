// Single source of truth for the icon picker in the admin panel. The value
// is what's stored in the database; src/components/blocks/BlockIcon.tsx maps
// each value to an actual icon component.
export const ICON_OPTIONS = [
  { label: 'Cross', value: 'cross' },
  { label: 'Open Bible', value: 'book' },
  { label: 'Flame (Holy Spirit)', value: 'flame' },
  { label: 'Heart', value: 'heart' },
  { label: 'People / Family', value: 'users' },
  { label: 'Prayer / Caring Hands', value: 'prayer' },
  { label: 'Globe', value: 'globe' },
  { label: 'Church', value: 'church' },
  { label: 'Sparkles', value: 'sparkles' },
  { label: 'Water (Baptism)', value: 'water' },
  { label: 'Sun / Light', value: 'sun' },
  { label: 'Music / Worship', value: 'music' },
  { label: 'Home', value: 'home' },
  { label: 'Compass / Direction', value: 'compass' },
  { label: 'Crown', value: 'crown' },
  { label: 'Scroll', value: 'scroll' },
  { label: 'Lightbulb', value: 'lightbulb' },
  { label: 'Star', value: 'star' },
  { label: 'Dove', value: 'dove' },
  { label: 'Shield', value: 'shield' },
  { label: 'Eye / Vision', value: 'eye' },
  { label: 'Target', value: 'target' },
  { label: 'Location Pin', value: 'pin' },
  { label: 'Handshake', value: 'handshake' },
] as const

export type IconKey = (typeof ICON_OPTIONS)[number]['value']
