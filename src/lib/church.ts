// The day the church began. Anything that counts the church's years works from this one date: the "Years of Ministry"
// figure goes up by one every year on 10 October.
export const CHURCH_FOUNDED = { year: 2007, month: 10, day: 10 }

/** Whole years of ministry completed on the given day (in UK time): 19 from 10 October 2026, 20 from 10 October 2027. */
export function yearsOfMinistry(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const [year, month, day] = [get('year'), get('month'), get('day')]
  const hadAnniversary = month > CHURCH_FOUNDED.month || (month === CHURCH_FOUNDED.month && day >= CHURCH_FOUNDED.day)
  return year - CHURCH_FOUNDED.year - (hadAnniversary ? 0 : 1)
}

/**
 * A Stats block entry labelled "Years of Ministry" always shows the worked-out figure (for example "19+"), whatever was
 * typed as its value, so it never has to be edited by hand. Every other entry shows what was typed.
 */
export function statDisplayValue(item: { value: string; label: string }, now: Date = new Date()): string {
  return /years of ministry/i.test(item.label) ? `${yearsOfMinistry(now)}+` : item.value
}
