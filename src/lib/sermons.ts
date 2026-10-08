import type { Payload } from 'payload'

import { getChannelFeed, getVideoOEmbed, isSermonVideo, parseVideoTitle } from './youtubeFeed'
import { youtubeVideoId } from './youtube'

export type SermonItem = {
  key: string
  title: string
  speaker: string | null
  /** Used for filtering (e.g. "Glorious Entry"). */
  series: string | null
  /** Shown on the card (e.g. "Glorious Entry (Day 3)"). */
  seriesLabel: string | null
  date: string
  href: string
  image: string | null
  source: 'admin' | 'youtube' | 'picked'
}

/** Where a message or video is watched: its own page on COG TV. */
export const tvHref = (slug: string) => `/media/cog-tv/${slug}`

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

function mediaUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') return image.url
  return null
}

/**
 * Every sermon, newest first: the ones added by hand in the admin plus the
 * latest messages from the YouTube channel. A video that's already in the admin
 * isn't listed twice — the admin entry wins, so its speaker / series /
 * description can be filled in properly.
 *
 * By default the channel's prayer streams are left out (the home page wants
 * messages only); COG TV passes `includeOtherVideos` to list everything.
 */
export async function getSermonItems(
  payload: Payload,
  channelId: string | null | undefined,
  options: { includeOtherVideos?: boolean } = {},
): Promise<SermonItem[]> {
  const [sermons, feed] = await Promise.all([
    payload.find({ collection: 'sermons', sort: '-date', limit: 500 }),
    getChannelFeed(channelId),
  ])

  const items: SermonItem[] = sermons.docs.map((s) => ({
    key: `admin-${s.id}`,
    title: s.title,
    speaker: s.speaker ?? null,
    series: s.series ?? null,
    seriesLabel: s.series ?? null,
    date: s.date,
    href: tvHref(s.slug),
    image: mediaUrl(s.thumbnail),
    source: 'admin',
  }))

  const inAdmin = new Set(sermons.docs.map((s) => (s.videoUrl ? youtubeVideoId(s.videoUrl) : null)).filter(Boolean))
  for (const v of feed?.videos ?? []) {
    const isMessage = isSermonVideo(v.title)
    if ((!isMessage && !options.includeOtherVideos) || inAdmin.has(v.id)) continue
    // Only messages carry a speaker and series; for other videos (prayer streams) just the title part is kept, without the date after the bar.
    const p = isMessage ? parseVideoTitle(v.title) : { title: parseVideoTitle(v.title).title, speaker: null, series: null, seriesLabel: null }
    items.push({
      key: `yt-${v.id}`,
      title: p.title,
      speaker: p.speaker,
      series: p.series,
      seriesLabel: p.seriesLabel,
      date: v.published,
      href: tvHref(`yt-${v.id}`),
      image: youtubeThumb(v.id),
      source: 'youtube',
    })
  }

  return items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
}

export type YouTubeSermon = {
  id: string
  title: string
  speaker: string | null
  seriesLabel: string | null
  date: string | null
  description: string
}

/**
 * One channel video as a sermon page. Videos in the latest-15 feed have a date
 * and description; older ones fall back to YouTube's oEmbed (title only), but
 * only if they belong to this channel — otherwise anyone could put any video
 * on our site by editing the link.
 */
export async function getYouTubeSermon(id: string, channelId: string | null | undefined): Promise<YouTubeSermon | null> {
  const feed = await getChannelFeed(channelId)
  if (!feed) return null
  const inFeed = feed.videos.find((v) => v.id === id)
  if (inFeed) {
    const p = parseVideoTitle(inFeed.title)
    return { id, title: p.title, speaker: p.speaker, seriesLabel: p.seriesLabel, date: inFeed.published, description: inFeed.description }
  }
  const info = await getVideoOEmbed(id)
  if (!info || !feed.channelName || info.authorName !== feed.channelName) return null
  const p = parseVideoTitle(info.title)
  return { id, title: p.title, speaker: p.speaker, seriesLabel: p.seriesLabel, date: null, description: '' }
}
