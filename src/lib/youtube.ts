// Pulls the video ID out of the YouTube link formats people paste into the
// admin (watch, youtu.be, embed, shorts, live). Returns null for anything else
// so the caller can fall back to a plain embed.
export function youtubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})(?![\w-])/)
  const id = match?.[1]
  // "live_stream" is also 11 characters and appears in channel-live embed links.
  return id && id !== 'live_stream' ? id : null
}
