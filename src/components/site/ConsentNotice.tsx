import Link from 'next/link'

/**
 * Explicit consent language + Privacy Policy link, required before
 * submitting any public-facing form (CLR-003). Shared across every enquiry
 * form so the wording stays consistent and only needs updating in one place.
 */
export function ConsentNotice() {
  return (
    <label className="flex items-start gap-2 text-sm text-ink-muted">
      <input
        type="checkbox"
        name="consent"
        required
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
      />
      <span>
        I agree to my details being used to respond to this submission, in line with the{' '}
        <Link href="/privacy-policy" className="font-medium text-brand-600 underline hover:text-brand-700">
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  )
}
