'use server'

import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { getStripeClient } from '@/lib/stripe'

export type DonateState = { status: 'idle' | 'error'; message?: string }

function isSpam(formData: FormData): boolean {
  return String(formData.get('website') || '').length > 0
}

export async function createDonationCheckout(_prev: DonateState, formData: FormData): Promise<DonateState> {
  if (isSpam(formData)) {
    // Bots that fill the honeypot get a generic error rather than a
    // successful-looking redirect to nowhere — there's no "thank you" page
    // to fake here the way other forms do, since a real donor is meant to
    // land on Stripe next.
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }

  const stripe = getStripeClient()
  if (!stripe) {
    return {
      status: 'error',
      message: 'Online giving is not set up yet. Please use bank transfer in the meantime.',
    }
  }

  const amountPounds = Number(formData.get('amount'))
  if (!Number.isFinite(amountPounds) || amountPounds < 1) {
    return { status: 'error', message: 'Please enter a valid amount (£1 minimum).' }
  }
  const amountPence = Math.round(amountPounds * 100)

  const frequency = formData.get('frequency') === 'monthly' ? 'monthly' : 'one-time'
  const branch = String(formData.get('branch') || 'Newcastle')
  const fund = String(formData.get('fund') || 'General Fund')
  const donorName = String(formData.get('name') || '').trim()
  const donorEmail = String(formData.get('email') || '').trim()

  if (!donorName || !donorEmail) {
    return { status: 'error', message: 'Please enter your name and email.' }
  }

  const giftAidDeclared = formData.get('giftAidDeclared') === 'on'
  let giftAid: { declared: boolean; fullName?: string; address?: string; postcode?: string } = {
    declared: false,
  }
  if (giftAidDeclared) {
    const address = String(formData.get('giftAidAddress') || '').trim()
    const postcode = String(formData.get('giftAidPostcode') || '').trim()
    if (!address || !postcode) {
      return {
        status: 'error',
        message: 'Please provide your home address and postcode to claim Gift Aid, or untick the Gift Aid box.',
      }
    }
    giftAid = { declared: true, fullName: donorName, address, postcode }
  }

  const payload = await getPayloadClient()
  const donation = await payload.create({
    collection: 'donations',
    data: {
      donorName,
      donorEmail,
      amount: amountPence,
      branch,
      fund,
      frequency,
      giftAid,
      status: 'pending',
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: frequency === 'monthly' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      customer_email: donorEmail,
      client_reference_id: String(donation.id),
      metadata: { donationId: String(donation.id), branch, fund },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'gbp',
            unit_amount: amountPence,
            product_data: { name: `Donation — ${branch} — ${fund}` },
            ...(frequency === 'monthly' ? { recurring: { interval: 'month' as const } } : {}),
          },
        },
      ],
      success_url: `${baseUrl}/give/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/give/donate/cancelled`,
    })
  } catch (err) {
    console.error('Stripe checkout session creation failed:', err)
    return { status: 'error', message: 'Something went wrong starting checkout. Please try again.' }
  }

  if (!session.url) {
    return { status: 'error', message: 'Something went wrong starting checkout. Please try again.' }
  }

  // Deliberately outside the try/catch above — redirect() throws a special
  // Next.js control-flow error that must propagate, not be caught as a
  // generic failure.
  redirect(session.url)
}
