'use client'

import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { Container } from '../ui/Container'
import { navLinks } from './navLinks'

export function Nav({ churchName }: { churchName: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/90 backdrop-blur">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/COG-logo.webp"
            alt={churchName}
            width={1600}
            height={900}
            priority
            className="h-11 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <div key={link.href} className="group relative">
              <Link
                href={link.href}
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50 hover:text-brand-600"
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <div className="min-w-48 rounded-xl border border-border bg-surface p-2 shadow-lg">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-brand-50 hover:text-brand-600"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <Link
          href="/give"
          className="hidden rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-600 lg:inline-flex"
        >
          Give
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border lg:hidden"
        >
          <span className="sr-only">Menu</span>
          <div className="flex flex-col gap-1.5">
            <motion.span
              animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 6 : 0 }}
              className="h-0.5 w-5 origin-center bg-ink"
            />
            <motion.span
              animate={{ opacity: mobileOpen ? 0 : 1 }}
              className="h-0.5 w-5 bg-ink"
            />
            <motion.span
              animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -6 : 0 }}
              className="h-0.5 w-5 origin-center bg-ink"
            />
          </div>
        </button>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-paper lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2 font-medium text-ink hover:bg-brand-50"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-3 flex flex-col border-l border-border pl-3">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="rounded-lg px-3 py-1.5 text-sm text-ink-muted hover:bg-brand-50"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
