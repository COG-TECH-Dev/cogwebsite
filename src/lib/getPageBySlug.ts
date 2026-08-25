import { getPayloadClient } from './payload'

export async function getPageBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    draft: false,
    limit: 1,
  })
  return result.docs[0] ?? null
}
