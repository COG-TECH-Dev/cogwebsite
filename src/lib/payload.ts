import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'

/**
 * Cached per-request Payload Local API client. `cache()` ensures every
 * server component in a single request reuses the same instance instead of
 * re-initializing Payload once per call.
 */
export const getPayloadClient = cache(async () => {
  const payloadConfig = await config
  return getPayload({ config: payloadConfig })
})
