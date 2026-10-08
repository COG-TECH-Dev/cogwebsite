/** A link typed in the admin: only ever link to a real web address (never javascript:, data: and so on). */
export function safeWebUrl(value?: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}
