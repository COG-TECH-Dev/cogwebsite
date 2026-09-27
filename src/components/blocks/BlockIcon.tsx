import {
  Bird,
  BookOpen,
  Compass,
  Cross,
  Crown,
  Church,
  Droplets,
  Eye,
  Flame,
  Globe,
  HandHeart,
  Heart,
  HeartHandshake,
  House,
  Lightbulb,
  MapPin,
  Music,
  ScrollText,
  Shield,
  Sparkles,
  Star,
  Sun,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react'

import type { IconKey } from '@/blocks/iconOptions'

const ICONS: Record<IconKey, LucideIcon> = {
  cross: Cross,
  book: BookOpen,
  flame: Flame,
  heart: Heart,
  users: Users,
  prayer: HandHeart,
  globe: Globe,
  church: Church,
  sparkles: Sparkles,
  water: Droplets,
  sun: Sun,
  music: Music,
  home: House,
  compass: Compass,
  crown: Crown,
  scroll: ScrollText,
  lightbulb: Lightbulb,
  star: Star,
  dove: Bird,
  shield: Shield,
  eye: Eye,
  target: Target,
  pin: MapPin,
  handshake: HeartHandshake,
}

export function BlockIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  const Icon = name ? ICONS[name as IconKey] : undefined
  if (!Icon) return null
  return <Icon className={className} aria-hidden="true" strokeWidth={1.75} />
}
