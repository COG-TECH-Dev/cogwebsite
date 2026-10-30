// The Lead Pastor page. The welcome message and photo are edited under Settings > Lead Pastor page. Until a message is
// entered there, the page shows the draft below: it is written only from things the church already says about itself on
// this site (the About page and the home page welcome), it is NOT in the pastors' own words, and it should be replaced by
// theirs, or approved by them, before the site is made public.
export const LEAD_PASTOR = {
  name: 'Apostle Bright Onoka',
  title: 'Lead Pastor, City of God Christian Centre',
  spouse: 'Pastor Ufunwen Onoka',
  // From the Leadership page.
  about:
    'Apostle Bright Onoka is the Lead Pastor of City of God Christian Centre worldwide. He has a teaching and healing ministry that has touched countless lives both in the UK, Africa, and across the globe.',
}

export const DRAFT_WELCOME = [
  'Welcome to City of God Christian Centre. We are so glad you are here.',
  'Whether you are visiting for the first time, looking for a church family, or have walked with the Lord for many years, there is a place for you here. God loves you, and He has a purpose for your life.',
  'Our heart is to see lives healed, families restored and communities changed by the love and power of God, and to see a city and a generation transformed by His presence. We would love you to be part of that.',
  'Please join us on a Sunday, come along to a homegroup, or get in touch and let us pray with you. We cannot wait to meet you.',
  'God bless you.',
]

/** The welcome as paragraphs: the one entered in Settings if there is one, otherwise the draft. */
export function welcomeParagraphs(entered: string | null | undefined): string[] {
  const own = (entered ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  return own.length > 0 ? own : DRAFT_WELCOME
}
