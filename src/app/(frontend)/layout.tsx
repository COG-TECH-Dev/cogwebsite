import { Fraunces, Inter } from 'next/font/google'
import React from 'react'

import { getPayloadClient } from '@/lib/payload'
import { Analytics } from '@/components/site/Analytics'
import { CookieConsentBanner } from '@/components/site/CookieConsentBanner'
import { Footer } from '@/components/site/Footer'
import { Nav } from '@/components/site/Nav'
import { WhatsAppButton } from '@/components/site/WhatsAppButton'
import './styles.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })

export const metadata = {
  title: 'City of God Christian Centre',
  description: 'A Place to Belong, Believe, and Become.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const churchName = settings?.siteName || 'City of God Christian Centre'
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Nav churchName={churchName} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} churchName={churchName} />
        <WhatsAppButton />
        {gaId && <Analytics measurementId={gaId} />}
        <CookieConsentBanner />
      </body>
    </html>
  )
}
