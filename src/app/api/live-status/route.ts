import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { getLiveStatus } from '@/lib/youtubeLive'

// Public and tiny: the header button asks this about once a minute. The CDN
// holds each answer for 30 seconds, so YouTube is asked far less often than
// visitors ask us.
export async function GET() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const status = await getLiveStatus(settings?.socialLinks?.youtubeChannelId)
  return NextResponse.json(status, {
    headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30' },
  })
}
