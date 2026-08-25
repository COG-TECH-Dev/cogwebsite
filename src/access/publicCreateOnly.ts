import type { Access } from 'payload'

/**
 * For the `create` action of collections that accept public submissions
 * (prayer requests, contact/appointment/membership forms): anyone, logged in
 * or not, can submit. Pair with `pastoralReadOnly` for read/update/delete so
 * submissions stay private once created.
 */
export const publicCreateOnly: Access = () => true
