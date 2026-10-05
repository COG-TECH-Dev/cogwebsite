import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

import { getPayloadClient } from '@/lib/payload'
import { getStripeClient } from '@/lib/stripe'
import { processStripeEvent } from '@/lib/stripeEvents'

// Stripe's SDK needs Node's crypto module for signature verification — the
// Edge runtime doesn't have it.
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 400 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  try {
    await processStripeEvent(payload, event)
  } catch (err) {
    console.error('Error processing Stripe webhook event:', event.type, err)
    // Still 200 — a processing bug on our end shouldn't make Stripe hammer
    // retries forever; the raw event is visible in the Stripe dashboard for
    // manual reconciliation if this ever happens.
  }

  return NextResponse.json({ received: true })
}
