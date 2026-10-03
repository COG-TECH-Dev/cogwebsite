'use client'

/**
 * Forgets the visitor's saved cookie choice and reloads, so the consent
 * banner asks again. (Reloading also drops any analytics already running.)
 */
export function CookiePreferencesButton() {
  function reset() {
    try {
      localStorage.removeItem('cookie-consent')
    } catch {
      // Storage blocked — nothing saved to forget; the reload below is harmless.
    }
    window.location.reload()
  }

  return (
    <button type="button" onClick={reset} className="btn-primary">
      Change my cookie choice
    </button>
  )
}
