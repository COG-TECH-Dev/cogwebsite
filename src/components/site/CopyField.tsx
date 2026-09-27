'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API can be unavailable (e.g. insecure context) — the value
      // is still visible on screen to copy by hand, so failing silently here
      // isn't a dead end for the user.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-paper px-4 py-3 text-left transition-colors hover:border-gold-300"
    >
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
        <span className="font-mono text-base font-semibold text-brand-700">{value}</span>
      </span>
      <span className="flex items-center gap-1.5 text-xs font-semibold text-gold-600">
        {copied ? (
          <>
            <Check className="h-4 w-4" aria-hidden="true" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy
          </>
        )}
      </span>
    </button>
  )
}
