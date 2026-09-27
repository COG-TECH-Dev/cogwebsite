import type { IconKey } from '@/blocks/iconOptions'

// Falls back to a sensible icon based on the ministry's name when no icon
// has been picked in the admin panel — keeps freshly-created ministries from
// looking unfinished before anyone has had a chance to set one.
const KEYWORD_ICONS: [RegExp, IconKey][] = [
  [/prayer|intercess/i, 'prayer'],
  [/youth|teen/i, 'flame'],
  [/child|kid/i, 'heart'],
  [/media|tech|video|stream/i, 'sparkles'],
  [/\bwomen'?s\b/i, 'crown'],
  [/\bmen'?s\b/i, 'shield'],
  [/music|choir|worship|praise/i, 'music'],
  [/usher|hospitality|welcome/i, 'handshake'],
  [/mission|outreach|evangel/i, 'globe'],
  [/bible|study|discipleship/i, 'book'],
  [/marriage|couple|family/i, 'home'],
]

export function guessMinistryIcon(name: string): IconKey {
  for (const [pattern, icon] of KEYWORD_ICONS) {
    if (pattern.test(name)) return icon
  }
  return 'users'
}
