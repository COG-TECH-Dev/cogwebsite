/**
 * The site's public base URL, used for absolute links in social-share
 * metadata. Prefers an https NEXT_PUBLIC_SERVER_URL; otherwise falls back to
 * Vercel's production domain (so a missing/localhost value in a deployment
 * can't poison share links); otherwise localhost for development.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SERVER_URL
  if (configured?.startsWith('https://')) return configured.replace(/\/$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel}`
  return configured?.replace(/\/$/, '') || 'http://localhost:3000'
}
