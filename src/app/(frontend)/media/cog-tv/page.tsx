import { MediaCategoryGrid } from '@/components/site/MediaCategoryGrid'

export const revalidate = 60
export const metadata = { title: 'COG TV' }

export default function CogTvPage() {
  return (
    <MediaCategoryGrid category="cog-tv" eyebrow="Media" title="COG TV" description="Watch our video content." />
  )
}
