import { MediaCategoryGrid } from '@/components/site/MediaCategoryGrid'

export const revalidate = 60
export const metadata = { title: 'COG Grand Radio' }

export default function CogGrandRadioPage() {
  return (
    <MediaCategoryGrid
      category="cog-grand-radio"
      eyebrow="Media"
      title="COG Grand Radio"
      description="Listen live and on demand."
    />
  )
}
