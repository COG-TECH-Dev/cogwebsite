'use client'

import { Play, Tv } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { BrandPanel } from '@/components/ui/BrandVisuals'

// Click-to-play for YouTube. A page can hold several videos, and each real
// YouTube player pulls in hundreds of KB of script — so nothing from YouTube
// loads (and no YouTube cookies are set) until a visitor chooses to watch.
// Video thumbnails are fetched through our own image proxy for the same
// reason: the visitor's browser doesn't contact Google until they press play.
//
// Fills its parent, which must be `relative` with a fixed shape (aspect-video).
export function YouTubePlayer({
  title,
  videoId,
  channelId,
  prompt,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
}: {
  title: string
  /** A single video. */
  videoId?: string
  /** A channel's current live stream (shows YouTube's own message if not live). */
  channelId?: string
  prompt?: string
  sizes?: string
}) {
  const [playing, setPlaying] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)

  // Move keyboard focus into the player once it replaces the button.
  useEffect(() => {
    if (playing) frameRef.current?.focus()
  }, [playing])

  if (!videoId && !channelId) return null

  if (playing) {
    const src = videoId
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`
      : `https://www.youtube-nocookie.com/embed/live_stream?channel=${encodeURIComponent(channelId!)}&autoplay=1`
    return (
      <iframe
        ref={frameRef}
        src={src}
        className="absolute inset-0 h-full w-full"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        title={title}
      />
    )
  }

  if (videoId) {
    return (
      <div className="absolute inset-0 bg-brand-900">
        {/* hqdefault is 4:3 with black bars; cropping to 16:9 trims exactly those bars. */}
        <Image
          src={`https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
        />
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 flex items-center justify-center bg-brand-900/30 transition-colors hover:bg-brand-900/10 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-brand-700 shadow-lg transition-transform group-hover:scale-110 sm:h-16 sm:w-16">
            <Play className="h-6 w-6 translate-x-0.5 sm:h-7 sm:w-7" fill="currentColor" aria-hidden="true" />
          </span>
        </button>
      </div>
    )
  }

  return (
    // BrandPanel sets its own position, so it can't also be absolutely
    // positioned — this wrapper is what fills the video-shaped box.
    <div className="absolute inset-0">
      <BrandPanel className="flex h-full flex-col items-center justify-center px-6 text-center text-white">
        {/* The icon is dropped on phones, where the video-shaped box is too short for it. */}
        <Tv className="hidden h-8 w-8 text-gold-300 sm:block" aria-hidden="true" />
        <p className="font-serif text-lg font-semibold sm:mt-3 sm:text-2xl">{prompt ?? 'Join our service from anywhere'}</p>
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:mt-6 sm:px-6 sm:py-3"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          Play live stream
        </button>
      </BrandPanel>
    </div>
  )
}
