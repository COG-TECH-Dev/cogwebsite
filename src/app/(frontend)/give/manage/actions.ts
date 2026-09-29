'use server'

import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { getStripeClient } from '@/lib/stripe'

export type ManageGivingState = { status: 'idle' | 'error'; message?: string }

// No login system on this site (a member portal is out of scope per the
// BRD), so a donor looking to amend/cancel recurring giving is identified by
// the email they gave at checkout — good enough to find their Stripe
// customer record and hand them into Stripe's own hosted portal, without us
// building any account system of our own.
export async function openBillingPortal(_prev: ManageGivingState, formData: FormData): Promise<ManageGivingState> {
  const stripe = getStripeClient()
  if (!stripe) {
    return { status: 'error', message: 'Online giving is not set up yet.' }
  }

  const email = String(formData.get('email') || '').trim()
  if (!email) {
    return { status: 'error', message: 'Please enter the email you used when giving.' }
  }

  const payload = await getPayloadClient()
  const match = await payload.find({
    collection: 'donations',
    where: {
      and: [
        { donorEmail: { equals: email } },
        { frequency: { equals: 'monthly' } },
        { stripeCustomerId: { exists: true } },
      ],
    },
    sort: '-createdAt',
    limit: 1,
  })

  const customerId = match.docs[0]?.stripeCustomerId
  if (!customerId) {
    return {
      status: 'error',
      message: "We couldn't find a recurring gift under that email. Contact the church office if you need help.",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  let session
  try {
    session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/give`,
    })
  } catch (err) {
    console.error('Failed to create Stripe billing portal session:', err)
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }

  // Outside the try/catch above — redirect() throws a special Next.js
  // control-flow error that must propagate, not be caught as a failure.
  redirect(session.url)
}
