import Link from 'next/link'

/**
 * Explicit consent language + Privacy Policy link, required before
 * submitting any public-facing form (CLR-003). Shared across every enquiry
 * form so the wording stays consistent and only needs updating in one place.
 * `dark` swaps in light-on-dark colors for forms placed on a brand-gradient
 * card (e.g. the event RSVP panel) instead of the default surface.
 */
export function ConsentNotice({ dark = false }: { dark?: boolean }) {
  return (
    <label className={`flex items-start gap-2 text-sm ${dark ? 'text-white/80' : 'text-ink-muted'}`}>
      <input
        type="checkbox"
        name="consent"
        required
        className={`mt-0.5 h-4 w-4 shrink-0 rounded ${dark ? 'border-white/40' : 'border-border'}`}
      />
      <span>
        I agree to my details being used to respond to this submission, in line with the{' '}
        <Link
          href="/privacy-policy"
          className={`font-medium underline ${dark ? 'text-gold-300 hover:text-gold-200' : 'text-brand-600 hover:text-brand-700'}`}
        >
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  )
}
