'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import type { ReactNode } from 'react'

const styles = {
  primary: 'bg-gold-500 text-brand-700 hover:bg-gold-600',
  secondary: 'bg-brand-600 text-white hover:bg-brand-500',
  outline: 'border border-current text-current hover:bg-white/10',
} as const

const MotionLink = motion.create(Link)

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
    <MotionLink
      href={href}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </MotionLink>
  )
}
