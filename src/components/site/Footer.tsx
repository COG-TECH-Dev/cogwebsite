import Link from 'next/link'

import type { Setting } from '@/payload-types'
import { Container } from '../ui/Container'
import { navLinks } from './navLinks'

export function Footer({ settings, churchName }: { settings: Setting | null; churchName: string }) {
  const serviceTimes = settings?.serviceTimes ?? []
  const social = settings?.socialLinks
  const address = settings?.address

  return (
    <footer className="border-t border-border bg-brand-700 text-white">
      <Container className="grid gap-10 py-16 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl font-semibold">{churchName}</p>
          {settings?.footerText ? (
            <p className="mt-3 max-w-sm text-sm text-white/70">{settings.footerText}</p>
          ) : null}
          {(address?.line1 || address?.city) && (
            <p className="mt-4 text-sm text-white/70">
              {address?.line1}
              {address?.line1 && <br />}
              {[address?.city, address?.postcode].filter(Boolean).join(', ')}
            </p>
          )}
          {settings?.contactEmail && (
            <p className="mt-2 text-sm text-white/70">{settings.contactEmail}</p>
          )}
          {settings?.contactPhone && (
            <p className="text-sm text-white/70">{settings.contactPhone}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-300">Service Times</p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {serviceTimes.length > 0 ? (
              serviceTimes.map((service, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>{service.label}</span>
                  <span className="text-white/60">{service.time}</span>
                </li>
              ))
            ) : (
              <li className="text-white/50">Service times coming soon.</li>
            )}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-300">Explore</p>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-white/80">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-gold-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {(social?.facebook || social?.instagram || social?.youtube) && (
            <div className="mt-6 flex gap-4 text-sm">
              {social?.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300">
                  Facebook
                </a>
              )}
              {social?.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300">
                  Instagram
                </a>
              )}
              {social?.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300">
                  YouTube
                </a>
              )}
            </div>
          )}
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container>
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} {churchName}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  )
}
