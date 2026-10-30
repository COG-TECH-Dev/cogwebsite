/** The number in a price written for people, like "£10" or "£9.99", or null when there is none. */
export function priceNumber(display: string | null | undefined): number | null {
  const m = (display ?? '').match(/\d+(?:\.\d{1,2})?/)
  return m ? Number(m[0]) : null
}

/** A total like "£20" or "£19.98" for a quantity of a book, or null when the price cannot be read. */
export function totalDisplay(display: string | null | undefined, quantity: number): string | null {
  const each = priceNumber(display)
  if (each === null) return null
  const total = Math.round(each * quantity * 100) / 100
  return `£${Number.isInteger(total) ? total : total.toFixed(2)}`
}

export const MAX_BOOKS_PER_ORDER = 10
