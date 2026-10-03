import { getPayloadClient } from './payload'
import { publishedOnly } from './published'

export async function getPageBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { and: [{ slug: { equals: slug } }, publishedOnly] },
    draft: false,
    limit: 1,
  })
  return result.docs[0] ?? null
}
