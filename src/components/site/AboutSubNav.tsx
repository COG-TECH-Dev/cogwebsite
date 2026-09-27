'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Overview', href: '/about' },
  { label: 'Vision & Mission', href: '/about/vision-mission' },
  { label: 'Tenets', href: '/about/tenets' },
  { label: 'History', href: '/about/history' },
  { label: 'Leadership', href: '/about/leadership' },
]

export function AboutSubNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="About sections" className="-mx-1 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              active
                ? 'bg-gold-500 text-brand-700 shadow-md'
                : 'bg-white/10 text-white backdrop-blur hover:bg-white/20'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
