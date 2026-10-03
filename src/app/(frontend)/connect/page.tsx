import {
  CalendarCheck,
  DoorOpen,
  FileText,
  Footprints,
  Heart,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircleHeart,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import type { ComponentType } from 'react'

import { DutyPastorCard } from '@/components/site/DutyPastorCard'
import { ACCENTS } from '@/components/ui/BrandVisuals'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const metadata = { title: 'Connect' }

const sections: { label: string; href: string; description: string; icon: ComponentType<{ className?: string }> }[] = [
  { label: "I'm New Here", href: '/connect/new-here', description: 'Planning a visit? Start here.', icon: DoorOpen },
  { label: 'Take a Step of Faith', href: '/connect/next-steps', description: 'Begin or recommit your journey with Jesus.', icon: Footprints },
  { label: 'Find a Homegroup', href: '/connect/homegroups', description: 'Join a small group near you.', icon: Users },
  { label: 'Prayer Request', href: '/connect/prayer-request', description: "Share what's on your heart.", icon: MessageCircleHeart },
  { label: 'Prayer Wall', href: '/connect/prayer-wall', description: 'Pray for requests shared by our church family.', icon: Heart },
  { label: 'Find a Church', href: '/connect/find-a-campus', description: 'Moving away? Find the church closest to you.', icon: MapPin },
  { label: 'Share a Testimony', href: '/connect/share-testimony', description: 'Tell us what God has done in your life.', icon: Sparkles },
  { label: 'Welfare & Support', href: '/connect/welfare', description: 'Discreet help in difficult times.', icon: HeartHandshake },
  { label: 'Contact Us', href: '/connect/contact', description: 'General questions and enquiries.', icon: Mail },
  { label: 'Appointments', href: '/connect/appointments', description: 'Book time with our pastoral team.', icon: CalendarCheck },
  { label: 'Membership', href: '/connect/membership', description: 'Take the next step and join us.', icon: UserPlus },
  { label: 'Reference Letter', href: '/connect/reference-letter', description: 'Request a character or membership letter.', icon: FileText },
]

export default function ConnectPage() {
  return (
    <div>
      <PageHeader eyebrow="Connect" title="We'd Love to Hear From You" />
      <Container className="py-16">
        <DutyPastorCard className="mx-auto mb-10 max-w-xl" />
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            const Icon = section.icon
            return (
              <StaggerItem key={section.href} className="h-full">
                <Link
                  href={section.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${accent.bar}`} />
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent.badge}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 font-serif text-xl font-semibold text-brand-700 group-hover:text-brand-600">
                    {section.label}
                  </h2>
                  <p className="mt-2 text-sm text-ink-muted">{section.description}</p>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </Container>
    </div>
  )
}
