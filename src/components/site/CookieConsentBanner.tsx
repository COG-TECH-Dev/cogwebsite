'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'cookie-consent'
export const CONSENT_EVENT = 'cookie-consent-change'

/**
 * Simple accept/reject cookie banner. Doesn't set any cookie itself — it
 * only gates whether Analytics.tsx loads GA4's script, and remembers the
 * choice in localStorage. Fires CONSENT_EVENT so Analytics can react
 * immediately without a page reload.
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Deferred to a microtask rather than called synchronously in the effect
    // body — avoids the cascading-render footgun the lint rule warns about,
    // while still only running once on mount.
    queueMicrotask(() => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
      } catch {
        // localStorage unavailable (private browsing, blocked site data) —
        // just skip the banner rather than risk breaking the page over it.
      }
    })
  }, [])

  function choose(value: 'accepted' | 'rejected') {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Same as above — the choice just won't be remembered next visit.
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface p-4 shadow-lg sm:p-5">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          We use cookies to understand how visitors use our site. Read our{' '}
          <Link href="/privacy-policy" className="font-medium text-brand-600 underline hover:text-brand-700">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose('rejected')}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => choose('accepted')}
            className="btn-primary px-4 py-2 text-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
