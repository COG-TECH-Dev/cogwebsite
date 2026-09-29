import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

import { getPayloadClient } from '@/lib/payload'
import { getStripeClient } from '@/lib/stripe'

// Stripe's SDK needs Node's crypto module for signature verification — the
// Edge runtime doesn't have it.
export const runtime = 'nodejs'

function formatAmount(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

async function sendReceiptEmail(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  to: string,
  name: string,
  amount: number,
  fund: string,
  frequency: string,
) {
  try {
    await payload.sendEmail({
      to,
      subject: 'Thank You for Your Gift',
      text: `Dear ${name},\n\nThank you for your ${frequency === 'monthly' ? 'recurring monthly' : ''} gift of ${formatAmount(amount)} to ${fund} at City of God Christian Centre. We're deeply grateful for your generosity.\n\nGod bless you.`,
    })
  } catch (err) {
    // A failed confirmation email shouldn't fail the whole webhook — the
    // donation is still correctly recorded either way.
    console.error('Failed to send donation receipt email:', err)
  }
}

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
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const donationId = session.client_reference_id || session.metadata?.donationId
        if (!donationId) break

        const donation = await payload.findByID({ collection: 'donations', id: Number(donationId) }).catch(() => null)
        if (!donation) break

        // Idempotent — Stripe can and does retry webhook deliveries.
        if (donation.status === 'completed') break

        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

        await payload.update({
          collection: 'donations',
          id: donation.id,
          data: {
            status: 'completed',
            paidAt: new Date().toISOString(),
            stripeCheckoutSessionId: session.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
        })

        await sendReceiptEmail(payload, donation.donorEmail, donation.donorName, donation.amount, donation.fund, donation.frequency)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        // Recent Stripe API versions nest this under parent.subscription_details
        // rather than a top-level invoice.subscription field.
        const subscriptionRef = invoice.parent?.subscription_details?.subscription
        const subscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id
        if (!subscriptionId) break

        // Idempotent — skip if we've already recorded this exact invoice.
        const already = await payload.find({
          collection: 'donations',
          where: { stripeInvoiceId: { equals: invoice.id } },
          limit: 1,
        })
        if (already.docs[0]) break

        const original = await payload.find({
          collection: 'donations',
          where: { stripeSubscriptionId: { equals: subscriptionId } },
          sort: '-createdAt',
          limit: 1,
        })
        const source = original.docs[0]
        if (!source) break

        if (!source.stripeInvoiceId) {
          // First invoice of a subscription just created via Checkout —
          // checkout.session.completed already recorded this same payment,
          // so tag the existing record instead of duplicating it.
          await payload.update({
            collection: 'donations',
            id: source.id,
            data: { stripeInvoiceId: invoice.id },
          })
        } else {
          // A genuine renewal — record it as its own gift so Gift Aid
          // claims reflect the real date and amount of each charge.
          const newDonation = await payload.create({
            collection: 'donations',
            data: {
              donorName: source.donorName,
              donorEmail: source.donorEmail,
              amount: invoice.amount_paid,
              branch: source.branch,
              fund: source.fund,
              frequency: 'monthly',
              giftAid: source.giftAid,
              status: 'completed',
              paidAt: new Date().toISOString(),
              stripeCustomerId: source.stripeCustomerId,
              stripeSubscriptionId: subscriptionId,
              stripeInvoiceId: invoice.id,
            },
          })
          await sendReceiptEmail(
            payload,
            newDonation.donorEmail,
            newDonation.donorName,
            newDonation.amount,
            newDonation.fund,
            'monthly',
          )
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Error processing Stripe webhook event:', event.type, err)
    // Still 200 — a processing bug on our end shouldn't make Stripe hammer
    // retries forever; the raw event is visible in the Stripe dashboard for
    // manual reconciliation if this ever happens.
  }

  return NextResponse.json({ received: true })
}
