// Reads the church's YouTube channel from YouTube's public RSS feed — no API
// key or account access needed. The feed only ever holds the latest 15 videos,
// and the fetch is cached for 15 minutes, so a new upload shows up on the site
// shortly after it is published without anyone touching the admin.
//
// Everything here fails soft: if YouTube can't be reached the site simply shows
// what's in the admin instead.

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

export async function getChannelFeed(channelId: string | null | undefined): Promise<ChannelFeed | null> {
  const id = channelId?.trim()
  if (!id || !CHANNEL_ID.test(id)) return null
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
      .filter((v) => /^[\w-]{11}$/.test(v.id) && v.title)
    return { channelName: pick(head, 'title'), videos }
  } catch {
    return null
  }
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
