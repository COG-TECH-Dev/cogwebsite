import { Camera, Mic, Radio, Tv } from 'lucide-react'
import Link from 'next/link'
import type { ComponentType } from 'react'

import { getPayloadClient } from '@/lib/payload'
import { ACCENTS, BrandPanel } from '@/components/ui/BrandVisuals'
import { YouTubePlayer } from '@/components/site/YouTubePlayer'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { StaggerGroup, StaggerItem } from '@/components/ui/Stagger'

export const revalidate = 60
export const metadata = { title: 'Media' }

const sections: { label: string; href: string; description: string; icon: ComponentType<{ className?: string }> }[] = [
  { label: 'Sermons', href: '/media/sermons', description: 'Catch up on recent messages.', icon: Mic },
  { label: 'Gallery', href: '/media/gallery', description: 'Photos from church life.', icon: Camera },
  { label: 'COG TV', href: '/media/cog-tv', description: 'Watch our video content.', icon: Tv },
  { label: 'COG Grand Radio', href: '/media/cog-grand-radio', description: 'Listen live and on demand.', icon: Radio },
]

export default async function MediaHubPage() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const radioUrl = settings?.socialLinks?.radioUrl
  const youtubeChannelId = settings?.socialLinks?.youtubeChannelId

  return (
    <div>
      <PageHeader eyebrow="Media" title="Watch, Listen, and Explore" />
      <Container className="py-16">
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            const Icon = section.icon
            return (
              <StaggerItem key={section.href} className="h-full">
                <Link
                  href={section.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${accent.bar}`} />
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent.badge}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 font-serif text-xl font-semibold text-brand-700">{section.label}</h2>
                  <p className="mt-2 text-sm text-ink-muted">{section.description}</p>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerGroup>

        {youtubeChannelId && (
          <div className="mt-12">
            <div className="mb-4 flex items-center gap-2">
              <Tv className="h-5 w-5 text-gold-600" aria-hidden="true" />
              <h2 className="font-serif text-xl font-semibold text-brand-700">Watch Live</h2>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border shadow-lg">
              <YouTubePlayer channelId={youtubeChannelId} title="City of God Christian Centre live stream" />
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              Nothing streaming right now? Check back during a service, or watch{' '}
              <Link href="/media/cog-tv" className="font-medium text-brand-600 hover:underline">
                past messages on COG TV
              </Link>
              .
            </p>
          </div>
        )}

        {radioUrl && (
          <BrandPanel className="mt-12 rounded-3xl p-8 text-center text-white sm:p-12">
            <Radio className="mx-auto h-10 w-10 text-gold-300" aria-hidden="true" />
            <h2 className="mt-4 font-serif text-2xl font-semibold sm:text-3xl">COG Grand Radio is Live</h2>
            <p className="mx-auto mt-2 max-w-lg text-white/80">
              Tune in anytime for worship, teaching, and encouragement — streaming 24/7.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={radioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-300"
              >
                Listen Live
              </a>
              <Link
                href="/media/cog-grand-radio#app"
                className="inline-flex items-center justify-center rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Get the app
              </Link>
            </div>
          </BrandPanel>
        )}
      </Container>
    </div>
  )
}
