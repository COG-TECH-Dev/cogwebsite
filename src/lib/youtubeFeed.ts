// Reads the church's YouTube channel — no API key or account access needed. Two public
// sources are combined: the RSS feed (the latest 15 videos, with exact dates and
// descriptions; cached for 15 minutes) and the channel's "uploads" page (its latest
// 100 videos, with dates as exact as "2 weeks ago"). Most of the feed's 15 are the
// daily prayer streams, so the uploads page is what lets COG TV always have 15
// messages to show.
//
// YouTube's feed sometimes just answers "404 Not Found" for a day or so. When that
// happens the uploads page carries on alone, and the last good list is also kept
// in the database (Payload's key-value store) as a final fallback.
//
// Everything here fails soft: if nothing can be reached the site shows what's in
// the admin instead.
import type { Payload } from 'payload'

export type ChannelVideo = {
  id: string
  title: string
  /** ISO date the video was published. */
  published: string
  description: string
}

export type ChannelFeed = { channelName: string; videos: ChannelVideo[] }

const CHANNEL_ID = /^UC[\w-]{22}$/

const decode = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')

const pick = (xml: string, tag: string) => {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return m ? decode(m[1].trim()) : ''
}

const VIDEO_ID = /^[\w-]{11}$/
const FRESH_MS = 15 * 60 * 1000

/** First choice: the RSS feed. Exact dates and descriptions, but only the latest 15, and YouTube sometimes 404s it. */
async function fetchRssFeed(id: string): Promise<ChannelFeed | null> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const xml = await res.text()
    const [head, ...entries] = xml.split('<entry>')
    const videos = entries
      .map((entry): ChannelVideo => ({
        id: pick(entry, 'yt:videoId'),
        title: pick(entry, 'title'),
        published: pick(entry, 'published'),
        description: pick(entry, 'media:description'),
      }))
      .filter((v) => VIDEO_ID.test(v.id) && v.title)
    return videos.length > 0 ? { channelName: pick(head, 'title'), videos } : null
  } catch {
    return null
  }
}

const MINUTE = 60_000
const DAY = 86_400_000

/** "3 days ago", "1 hr ago", "2 mo ago" -> an ISO date (as close as YouTube says it). */
function approxDate(text: string, now: number): string | null {
  const m = text.match(/(\d+)\s*([a-z]+)\s+ago/i)
  if (!m) return null
  const unit = m[2].toLowerCase()
  let ms = DAY
  if (unit.startsWith('s')) ms = 1000
  else if (unit.startsWith('mo')) ms = 30 * DAY
  else if (unit.startsWith('mi') || unit === 'm') ms = MINUTE
  else if (unit.startsWith('h')) ms = 60 * MINUTE
  else if (unit.startsWith('w')) ms = 7 * DAY
  else if (unit.startsWith('y')) ms = 365 * DAY
  return new Date(now - Number(m[1]) * ms).toISOString()
}

/** A "dd/mm/yyyy" in a title (the channel puts the service date there) as an ISO date, or null. */
function dateInTitle(title: string): string | null {
  const m = title.match(/(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{4}|\d{2})(?!\d)/)
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2])
  const year = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3])
  const d = new Date(Date.UTC(year, month - 1, day, 12))
  return Number.isNaN(d.getTime()) || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day ? null : d.toISOString()
}

/**
 * When a video was published, from what the page says ("2 wk ago"). Older videos are only given to the nearest week or
 * month, so a date written in the title is preferred when it agrees with that to within about six weeks.
 */
function pageDate(title: string, when: string | undefined, now: number): string {
  const approx = (when && approxDate(when, now)) || new Date(now).toISOString()
  const fromTitle = dateInTitle(title)
  return fromTitle && Math.abs(Date.parse(fromTitle) - Date.parse(approx)) < 45 * DAY ? fromTitle : approx
}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null

/** Every video card in YouTube's page data, newest first (the page's own order), in either of its two layouts. */
function videosFromPageData(data: unknown, now: number): ChannelVideo[] {
  const out: ChannelVideo[] = []
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk)
    if (!isObj(node)) return
    const lockup = node.lockupViewModel
    const renderer = node.videoRenderer
    if (isObj(lockup) && lockup.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO' && typeof lockup.contentId === 'string') {
      const meta = isObj(lockup.metadata) && isObj(lockup.metadata.lockupMetadataViewModel) ? lockup.metadata.lockupMetadataViewModel : {}
      const title = isObj(meta.title) && typeof meta.title.content === 'string' ? meta.title.content : ''
      const rows = isObj(meta.metadata) && isObj(meta.metadata.contentMetadataViewModel) ? meta.metadata.contentMetadataViewModel.metadataRows : []
      const parts = (Array.isArray(rows) ? rows : []).flatMap((r) => (isObj(r) && Array.isArray(r.metadataParts) ? r.metadataParts : []))
      const when = parts
        .map((p) => (isObj(p) && isObj(p.text) && typeof p.text.content === 'string' ? p.text.content : ''))
        .find((t) => /\bago\b/i.test(t))
      out.push({ id: lockup.contentId, title, published: pageDate(title, when, now), description: '' })
    } else if (isObj(renderer) && typeof renderer.videoId === 'string') {
      const runs = isObj(renderer.title) && Array.isArray(renderer.title.runs) ? renderer.title.runs : []
      const title = isObj(runs[0]) ? String(runs[0].text ?? '') : ''
      const when = isObj(renderer.publishedTimeText) && typeof renderer.publishedTimeText.simpleText === 'string' ? renderer.publishedTimeText.simpleText : ''
      out.push({ id: renderer.videoId, title, published: pageDate(title, when, now), description: '' })
    } else {
      Object.values(node).forEach(walk)
    }
  }
  walk(data)
  return out.filter((v) => VIDEO_ID.test(v.id) && v.title)
}

/**
 * Second source: the channel's "uploads" playlist page, which lists its latest 100 videos (the RSS feed holds only 15, and
 * most of those are the daily prayer streams). Dates are only as exact as "2 wk ago", and there is no description.
 */
async function fetchUploadsPage(id: string): Promise<ChannelFeed | null> {
  try {
    const res = await fetch(`https://www.youtube.com/playlist?list=UU${id.slice(2)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(9000),
      headers: {
        // A browser-like request; the cookie answers YouTube's consent page in advance.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'en-GB,en;q=0.9',
        Cookie: 'SOCS=CAI; CONSENT=YES+1',
      },
    })
    if (!res.ok) return null
    const html = await res.text()
    const m = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/)
    if (!m) return null
    const data: unknown = JSON.parse(m[1])
    const seen = new Set<string>()
    const videos = videosFromPageData(data, Date.now()).filter((v) => {
      if (seen.has(v.id)) return false
      seen.add(v.id)
      return true
    })
    const meta = isObj(data) && isObj(data.metadata) && isObj(data.metadata.playlistMetadataRenderer) ? data.metadata.playlistMetadataRenderer : {}
    const channelName = typeof meta.title === 'string' ? meta.title.replace(/^Uploads from\s+/i, '') : ''
    return videos.length > 0 ? { channelName, videos } : null
  } catch {
    return null
  }
}

type StoredFeed = ChannelFeed & { fetchedAt: number }

const KEEP = 100

/**
 * The channel's latest videos, newest first: up to 100 (15 from the feed with exact dates, the rest from the uploads
 * page). Pass `payload` so the list is remembered in the database for 15 minutes between visits, and kept as the fallback
 * for when YouTube can't be reached at all.
 */
export async function getChannelFeed(channelId: string | null | undefined, payload?: Payload): Promise<ChannelFeed | null> {
  const id = channelId?.trim()
  if (!id || !CHANNEL_ID.test(id)) return null
  const key = `youtube-feed:${id}`
  const stored = payload ? await payload.kv.get<StoredFeed>(key).catch(() => null) : null
  if (stored && Date.now() - stored.fetchedAt < FRESH_MS) return { channelName: stored.channelName, videos: stored.videos }

  const [rss, page] = await Promise.all([fetchRssFeed(id), fetchUploadsPage(id)])
  if (!rss && !page) return stored ? { channelName: stored.channelName, videos: stored.videos } : null

  // Exact dates and descriptions win (the feed's, or ones already in the database); the page only says "2 wk ago".
  const exact = new Map((rss?.videos ?? []).map((v) => [v.id, v]))
  const known = new Map((stored?.videos ?? []).map((v) => [v.id, v]))
  const merged = new Map<string, ChannelVideo>()
  for (const v of page?.videos ?? []) {
    const old = known.get(v.id)
    merged.set(v.id, exact.get(v.id) ?? (old?.description ? { ...v, published: old.published, description: old.description } : v))
  }
  for (const v of rss?.videos ?? []) if (!merged.has(v.id)) merged.set(v.id, v)
  // If the page could not be read, keep the older videos already known rather than shrinking to the feed's 15.
  if (!page) for (const v of stored?.videos ?? []) if (!merged.has(v.id)) merged.set(v.id, v)

  const videos = [...merged.values()].sort((a, b) => Date.parse(b.published) - Date.parse(a.published)).slice(0, KEEP)
  const feed: ChannelFeed = { channelName: rss?.channelName || page?.channelName || stored?.channelName || '', videos }
  if (payload) await payload.kv.set(key, { ...feed, fetchedAt: Date.now() } satisfies StoredFeed).catch(() => {})
  return feed
}

/**
 * Title and channel name of any public video, via YouTube's oEmbed endpoint.
 * Used for sermon links that have rolled off the latest-15 feed, so they keep
 * working. Callers must check the channel name before showing the video.
 */
export async function getVideoOEmbed(videoId: string): Promise<{ title: string; authorName: string } | null> {
  if (!/^[\w-]{11}$/.test(videoId)) return null
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(6000) },
    )
    if (!res.ok) return null
    const json = (await res.json()) as { title?: string; author_name?: string }
    return json.title ? { title: json.title, authorName: json.author_name ?? '' } : null
  } catch {
    return null
  }
}

/** The daily Morning / Evening Prayer streams are on the channel but aren't sermons. */
export const isSermonVideo = (title: string) => !/\b(morning|evening)\s+prayer\b/i.test(title)

const SPEAKER = /^(apostle|pastor|prophet|prophetess|rev|reverend|bishop|evangelist|minister|deacon|deaconess|elder|brother|bro|sister|sis|dr|mr|mrs|ms)\.?\s+\S/i
const DATE_ONLY = /^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/

/**
 * The channel titles its messages "Message title | Speaker | Series (Day 3) | 02/10/2026"
 * (every part after the title is optional). Pulls out what it can; anything it
 * doesn't recognise just stays in the title.
 */
export function parseVideoTitle(raw: string) {
  const parts = raw.split('|').map((p) => p.trim()).filter(Boolean)
  const title = (parts[0] ?? raw).replace(/^#+\s*/, '')
  const rest = parts.slice(1)
  const speaker = rest.find((p) => SPEAKER.test(p)) ?? null
  const seriesLabel = rest.find((p) => p !== speaker && !DATE_ONLY.test(p)) ?? null
  // "Glorious Entry (Day 2)" and "(Day 3)" belong to one series for filtering.
  const series = seriesLabel ? seriesLabel.replace(/\s*\((?:day|part)\s*\d+\)\s*$/i, '') : null
  return { title, speaker, series, seriesLabel }
}
