import { isAdminOrUp } from './isAdminOrUp'

/**
 * For collections holding sensitive pastoral data (prayer requests,
 * contact/appointment/membership submissions): only Admin/Pastor and Super
 * Admin can read, update, or delete. Content Editors and below never see
 * this data, since it's outside their remit.
 */
export const pastoralReadOnly = isAdminOrUp
