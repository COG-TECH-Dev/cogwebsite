// Is the church's YouTube channel live right now?
//
// YouTube's "/channel/<id>/live" page redirects to the live video when the
// channel is streaming (and marks it `"isLive":true`); when it isn't, it stays
// on the channel page. No API key or account access needed.
//
// It fails closed: anything unexpected (YouTube unreachable, a consent or bot
// check page, a markup change) reports "not live", so the button can never
// appear by mistake. `state` says which of those happened, so a broken check
// can be told apart from a channel that simply isn't live.

export type LiveStatus = {
  live: boolean
  videoId?: string
  /** "ok" = YouTube answered normally; "unreachable" / "blocked" = we couldn't tell. */
  state: 'ok' | 'unreachable' | 'blocked'
}

const CHANNEL_ID = /^UC[\w-]{22}$/
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// Every visitor's browser asks the site, and the site asks YouTube at most this
// often (per server instance); a CDN cache in front of the route cuts it further.
const TTL_MS = 30_000
let cached: { at: number; channelId: string; value: LiveStatus } | null = null

export async function getLiveStatus(channelId: string | null | undefined): Promise<LiveStatus> {
  const id = channelId?.trim()
  if (!id || !CHANNEL_ID.test(id)) return { live: false, state: 'ok' }
  if (cached && cached.channelId === id && Date.now() - cached.at < TTL_MS) return cached.value

  let value: LiveStatus
  try {
    const res = await fetch(`https://www.youtube.com/channel/${id}/live`, {
      cache: 'no-store',
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept-Language': 'en-GB,en;q=0.9',
        // Skips YouTube's cookie-consent interstitial, which would otherwise hide the page from servers in Europe.
        Cookie: 'SOCS=CAI; CONSENT=YES+1',
      },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) {
      value = { live: false, state: 'unreachable' }
    } else {
      const html = await res.text()
      const canonical = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/(watch\?v=([\w-]{11})|channel\/[\w-]+)"/)
      if (!canonical) {
        // Not the normal channel or video page: a consent, sign-in or bot-check page.
        value = { live: false, state: 'blocked' }
      } else if (canonical[2] && /"isLive":true/.test(html)) {
        value = { live: true, videoId: canonical[2], state: 'ok' }
      } else {
        value = { live: false, state: 'ok' }
      }
    }
  } catch {
    value = { live: false, state: 'unreachable' }
  }

  cached = { at: Date.now(), channelId: id, value }
  return value
}
