import Image from 'next/image'
import type { ReactNode } from 'react'

// Shared visual language for "no photo yet" states across the site — a
// branded gradient panel (with the logo, or initials, or an icon) instead of
// a blank box, plus the three-hue accent cycle sampled from the logo.
export const ACCENTS = [
  { badge: 'bg-gold-100 text-gold-600', bar: 'from-gold-500 to-gold-300', number: 'text-gold-500' },
  { badge: 'bg-flame-500/10 text-flame-500', bar: 'from-flame-500 to-gold-500', number: 'text-flame-500' },
  { badge: 'bg-sky-500/10 text-sky-500', bar: 'from-sky-500 to-gold-300', number: 'text-sky-500' },
]

export function Glows() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gold-500/30 blur-3xl" />
      <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-flame-500/20 blur-3xl" />
    </div>
  )
}

export function BrandPanel({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`relative isolate overflow-hidden bg-linear-to-br from-brand-900 via-brand-700 to-brand-500 ${className}`}>
      <Glows />
      {children}
    </div>
  )
}

// The default panel shown when no photo/image has been uploaded: the church
// logo centred on a branded gradient.
export function BrandLogoPanel({ className = '' }: { className?: string }) {
  return (
    <BrandPanel className={`flex items-center justify-center ${className}`}>
      <Image
        src="/images/COG-logo.webp"
        alt=""
        width={1600}
        height={900}
        sizes="(min-width: 1024px) 30vw, 70vw"
        className="h-auto w-3/4"
      />
    </BrandPanel>
  )
}
