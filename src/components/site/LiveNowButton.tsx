'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const POLL_MS = 60_000

// A red "Live" button in the header that appears while the church is streaming
// on YouTube and disappears again when the stream ends. It checks once a minute
// while the page is open and in view, and again whenever the tab is brought back.
// If a check fails it leaves things as they are rather than flicker.
export function LiveNowButton() {
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (document.visibilityState !== 'visible') return
      try {
        const res = await fetch('/api/live-status', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { live?: boolean }
        if (!cancelled) setLive(Boolean(data.live))
      } catch {
        // offline or a hiccup: keep showing whatever we showed before
      }
    }

    check()
    const timer = setInterval(check, POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  // The wrapper is always there so screen readers hear the button when it appears.
  return (
    <div aria-live="polite" className="flex items-center">
      {live && (
        <Link
          href="/#watch-live"
          aria-label="Live now on YouTube. Watch the service"
          className="live-pop inline-flex items-center gap-2 rounded-full bg-red-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-800 sm:px-4 sm:text-sm"
        >
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          <span>
            Live<span className="hidden 2xl:inline"> now</span>
          </span>
        </Link>
      )}
    </div>
  )
}
