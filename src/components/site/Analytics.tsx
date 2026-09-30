'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

import { CONSENT_EVENT } from './CookieConsentBanner'

const STORAGE_KEY = 'cookie-consent'

/**
 * Loads GA4 only after the visitor has accepted cookies — checks the stored
 * choice on mount, and reacts live to CONSENT_EVENT so accepting doesn't
 * require a page reload. Rendered at all only when
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is configured (see layout.tsx).
 */
export function Analytics({ measurementId }: { measurementId: string }) {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    // Deferred to a microtask rather than called synchronously in the effect
    // body — avoids the cascading-render footgun the lint rule warns about,
    // while still only running once on mount.
    queueMicrotask(() => {
      try {
        if (localStorage.getItem(STORAGE_KEY) === 'accepted') setConsented(true)
      } catch {
        // Treated as "not consented" — fine, analytics is opt-in by design.
      }
    })

    function onChange(e: Event) {
      const detail = (e as CustomEvent<'accepted' | 'rejected'>).detail
      setConsented(detail === 'accepted')
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  if (!consented) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  )
}
