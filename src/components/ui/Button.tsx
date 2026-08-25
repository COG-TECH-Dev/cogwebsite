import Link from 'next/link'
import type { ReactNode } from 'react'

const styles = {
  primary: 'bg-gold-500 text-brand-700 hover:bg-gold-600',
  secondary: 'bg-brand-600 text-white hover:bg-brand-500',
  outline: 'border border-current text-current hover:bg-white/10',
} as const

export function Button({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: keyof typeof styles
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}
