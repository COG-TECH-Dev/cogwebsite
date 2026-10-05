import type Stripe from 'stripe'

import type { getPayloadClient } from '@/lib/payload'

type Payload = Awaited<ReturnType<typeof getPayloadClient>>

function formatAmount(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

const longDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

async function sendReceiptEmail(
  payload: Payload,
  to: string,
  name: string,
  amount: number,
  fund: string,
  frequency: string,
) {
  const kind = frequency === 'weekly' ? 'recurring weekly ' : frequency === 'monthly' ? 'recurring monthly ' : ''
  try {
    await payload.sendEmail({
      to,
      subject: 'Thank You for Your Gift',
      text: `Dear ${name},\n\nThank you for your ${kind}gift of ${formatAmount(amount)} to ${fund} at City of God Christian Centre. We're deeply grateful for your generosity.\n\nGod bless you.`,
    })
  } catch (err) {
    // A failed confirmation email shouldn't fail the whole webhook — the
    // donation is still correctly recorded either way.
    console.error('Failed to send donation receipt email:', err)
  }
}

// For a recurring gift that starts on a later date the donor chose: nothing has
// been charged yet, so confirm what is set up and when the first gift will be taken.
async function sendScheduledEmail(
  payload: Payload,
  to: string,
  name: string,
  amount: number,
  fund: string,
  frequency: string,
  startDate: string | null | undefined,
) {
  const every = frequency === 'weekly' ? 'week' : 'month'
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL
  try {
    await payload.sendEmail({
      to,
      subject: 'Your Recurring Gift Is Set Up',
      text: `Dear ${name},\n\nThank you for setting up a ${frequency} gift of ${formatAmount(amount)} to ${fund} at City of God Christian Centre.\n\n${
        startDate ? `Your first gift will be taken on ${longDate(startDate)}, and then every ${every}. ` : ''
      }Your card is not charged before then.\n\nIf you ever need to change or stop it, you can do so from "Manage my recurring giving"${
        baseUrl ? ` (${baseUrl}/give/manage)` : ' on our Give page'
      }, or get in touch with the church office.\n\nGod bless you.`,
    })
  } catch (err) {
    console.error('Failed to send scheduled-gift email:', err)
  }
}

/**
 * Applies one verified Stripe event to our donation records (and sends the matching
 * email). Kept apart from the route so it can be exercised without a real Stripe event.
 */
export async function processStripeEvent(payload: Payload, event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const donationId = session.client_reference_id || session.metadata?.donationId
      if (!donationId) break

      const donation = await payload.findByID({ collection: 'donations', id: Number(donationId) }).catch(() => null)
      if (!donation) break

      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

      // Idempotent — Stripe can and does retry webhook deliveries, and for a
      // subscription the invoice event can arrive first. Either way the gift is
      // already recorded: only fill in what that earlier event could not know.
      if (donation.status === 'completed' || donation.status === 'scheduled') {
        if (!donation.stripeCheckoutSessionId) {
          await payload.update({
            collection: 'donations',
            id: donation.id,
            data: {
              stripeCheckoutSessionId: session.id,
              stripeCustomerId: donation.stripeCustomerId ?? customerId,
              stripeSubscriptionId: donation.stripeSubscriptionId ?? subscriptionId,
            },
          })
        }
        break
      }

      // A recurring gift that starts on a later date: the card is saved but nothing is
      // charged yet, so it is "scheduled" until its first real invoice is paid.
      const startsLater = session.mode === 'subscription' && session.payment_status === 'no_payment_required'

      await payload.update({
        collection: 'donations',
        id: donation.id,
        data: {
          status: startsLater ? 'scheduled' : 'completed',
          ...(startsLater ? {} : { paidAt: new Date().toISOString() }),
          stripeCheckoutSessionId: session.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        },
      })

      if (startsLater) {
        await sendScheduledEmail(
          payload,
          donation.donorEmail,
          donation.donorName,
          donation.amount,
          donation.fund,
          donation.frequency,
          donation.startDate,
        )
      } else {
        await sendReceiptEmail(payload, donation.donorEmail, donation.donorName, donation.amount, donation.fund, donation.frequency)
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      // A subscription that starts on a later date opens with a £0 invoice: that is not a gift.
      if (!invoice.amount_paid || invoice.amount_paid <= 0) break

      // Recent Stripe API versions nest this under parent.subscription_details
      // rather than a top-level invoice.subscription field.
      const details = invoice.parent?.subscription_details
      const subscriptionRef = details?.subscription
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
      // The invoice can arrive before checkout.session.completed has linked the subscription
      // to our record; the donation id we put on the subscription finds it anyway.
      const donationId = details?.metadata?.donationId
      const source =
        original.docs[0] ??
        (donationId ? await payload.findByID({ collection: 'donations', id: Number(donationId) }).catch(() => null) : null)
      if (!source) break

      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

      if (!source.stripeInvoiceId) {
        // The first paid invoice of a subscription created via Checkout. For an immediate
        // gift checkout.session.completed already recorded this same payment, so tag the
        // existing record instead of duplicating it. For one that started later it is
        // the moment the first gift is actually taken.
        const firstPayment = source.status !== 'completed'
        await payload.update({
          collection: 'donations',
          id: source.id,
          data: {
            stripeInvoiceId: invoice.id,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: source.stripeCustomerId ?? customerId,
            ...(firstPayment ? { status: 'completed' as const, paidAt: new Date().toISOString() } : {}),
          },
        })
        if (firstPayment) {
          await sendReceiptEmail(payload, source.donorEmail, source.donorName, source.amount, source.fund, source.frequency)
        }
      } else {
        // A genuine renewal — record it as its own gift so Gift Aid
        // claims reflect the real date and amount of each charge.
        const frequency = source.frequency === 'weekly' ? 'weekly' : 'monthly'
        const newDonation = await payload.create({
          collection: 'donations',
          data: {
            donorName: source.donorName,
            donorEmail: source.donorEmail,
            amount: invoice.amount_paid,
            branch: source.branch,
            fund: source.fund,
            frequency,
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
          frequency,
        )
      }
      break
    }

    default:
      break
  }
}
