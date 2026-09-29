import Stripe from 'stripe'

let client: Stripe | null | undefined

/**
 * Lazily constructs the Stripe client. Returns null when STRIPE_SECRET_KEY
 * isn't configured, so callers can fall back gracefully (bank transfer /
 * "coming soon") instead of crashing — same pattern as the Resend email
 * adapter in payload.config.ts.
 */
export function getStripeClient(): Stripe | null {
  if (client !== undefined) return client
  const key = process.env.STRIPE_SECRET_KEY
  client = key ? new Stripe(key) : null
  return client
}
