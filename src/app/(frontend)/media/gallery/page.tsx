import { MediaCategoryGrid } from '@/components/site/MediaCategoryGrid'

export const revalidate = 60
export const metadata = { title: 'Gallery' }

export default function GalleryPage() {
  return (
    <MediaCategoryGrid
      category="gallery"
      eyebrow="Media"
      title="Photo Gallery"
      description="Moments from church life and events."
    />
  )
}
