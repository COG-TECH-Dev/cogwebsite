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
      // On a phone the words and the Copy button stack (a button beside a narrow box squeezes the value into one letter
      // per line); from sm up they sit side by side.
      className="group flex w-full flex-col items-start gap-2 rounded-xl border border-border bg-paper px-4 py-3 text-left transition-colors hover:border-gold-300 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
        {/* Numbers and codes stay on one line (a sort code must not break at its dashes); a name wraps between words. */}
        <span className={`block break-words font-mono text-base font-semibold text-brand-700 ${value.includes(' ') ? '' : 'whitespace-nowrap'}`}>
          {value}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-gold-600">
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
