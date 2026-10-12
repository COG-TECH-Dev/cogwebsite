'use client'

import { ChevronUp } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

// Grace AI is a WhatsApp Business account (+44 7436 503035); a wa.me link built from the number opens a chat with it:
// the international number with no "+", spaces or leading 0.
const GRACE_CHAT_URL = 'https://wa.me/447436503035'
const WHATSAPP_CHANNEL_URL = 'https://www.whatsapp.com/channel/0029Vb6FzzpBvvsjxID3gf3h'

const OPTIONS = [
  { href: GRACE_CHAT_URL, label: 'Chat with Grace AI on WhatsApp' },
  { href: WHATSAPP_CHANNEL_URL, label: 'Follow on WhatsApp' },
]

/**
 * The floating WhatsApp button. It opens a small menu with the two ways to use WhatsApp with the church: chat with
 * Grace AI, or follow the church's channel. Both open WhatsApp in a new tab (the cookie policy notes they are plain links).
 */
export function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  // Escape closes the menu (and returns to the button); so does a click or tap anywhere else.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onPointer = (e: Event) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    // z-40 keeps it under the cookie banner (z-50) so the two never overlap controls.
    <aside ref={wrapRef} aria-label="WhatsApp" className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      {open && (
        <ul id={menuId} className="absolute bottom-full right-0 mb-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface p-2 shadow-xl">
          {OPTIONS.map((option) => (
            <li key={option.href}>
              <a
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-medium text-ink hover:bg-brand-50 hover:text-brand-600"
              >
                {option.label}
                <span className="sr-only"> (opens WhatsApp in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        // The accessible name must contain the visible words (WCAG 2.5.3), so voice-control
        // users can say what they see on screen. On phones only the icon shows.
        aria-label="WhatsApp: chat with Grace AI or follow our channel"
        // Darker than WhatsApp's #25D366, which gives white text only 2:1 contrast; this is 5.4:1.
        className="flex items-center gap-2 rounded-full bg-[#0b7a4b] p-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#096a41] sm:px-4"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm0 18.06h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.26-4.35c0-4.52 3.68-8.2 8.24-8.2 2.2 0 4.27.86 5.82 2.42a8.17 8.17 0 0 1 2.41 5.82c0 4.52-3.68 8.16-8.23 8.16Zm4.5-6.13c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.24-.64.81-.78.97-.15.16-.29.18-.53.06-.25-.12-1.04-.38-1.99-1.23-.73-.66-1.23-1.46-1.37-1.71-.14-.24-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.24.25-.4.08-.16.04-.3-.02-.43-.06-.12-.56-1.36-.77-1.86-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.3-.23.24-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.73 2.65 4.2 3.71.59.25 1.04.4 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.19.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
        </svg>
        <span className="hidden sm:inline">WhatsApp</span>
        <ChevronUp className={`hidden h-4 w-4 transition-transform sm:block ${open ? '' : 'rotate-180'}`} aria-hidden="true" />
      </button>
    </aside>
  )
}
