'use client'

import { Play, Tv } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { BrandPanel } from '@/components/ui/BrandVisuals'

// Click-to-play: nothing from YouTube loads (and no YouTube cookies are set)
// until a visitor chooses to watch, which also keeps the homepage fast. When
// the channel isn't streaming, YouTube shows its own "not live" message — but
// only to someone who asked to watch, not to everyone who lands on the page.
export function LiveStreamPlayer({ channelId }: { channelId: string }) {
  const [playing, setPlaying] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)

  // Move keyboard focus into the player once it replaces the button.
  useEffect(() => {
    if (playing) frameRef.current?.focus()
  }, [playing])

  if (playing) {
    return (
      <iframe
        ref={frameRef}
        src={`https://www.youtube-nocookie.com/embed/live_stream?channel=${encodeURIComponent(channelId)}&autoplay=1`}
        className="absolute inset-0 h-full w-full"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        title="City of God Christian Centre live stream"
      />
    )
  }

  return (
    // BrandPanel sets its own position, so it can't also be absolutely
    // positioned — this wrapper is what fills the video-shaped box.
    <div className="absolute inset-0">
      <BrandPanel className="flex h-full flex-col items-center justify-center px-6 text-center text-white">
        {/* The icon is dropped on phones, where the video-shaped box is too short for it. */}
        <Tv className="hidden h-8 w-8 text-gold-300 sm:block" aria-hidden="true" />
        <p className="font-serif text-lg font-semibold sm:mt-3 sm:text-2xl">Join our service from anywhere</p>
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:mt-6 sm:px-6 sm:py-3"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          Play live stream
        </button>
      </BrandPanel>
    </div>
  )
}
