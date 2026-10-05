// What the Ablaze Youth page shows until the youth team enters their own in the admin
// (Ministries > Ablaze Youth). The wording follows the church's Ablaze page at
// cityofgodchristiancentre.org/ablaze. That page gives no meeting times, age range or
// contact person, so none are made up here: the page points visitors at the church's
// contact form until a coordinator's details are added.

export const YOUTH_SLUG = 'ablaze-youth'

export const YOUTH_TAGLINE = 'Youths making a difference for Christ'

export const YOUTH_INTRO =
  'We help young people grow into godly men and women: getting into the Scriptures, serving in church, keeping wholesome relationships, and representing God in their communities and in the choices they make. Ablaze is a lively place with room to be creative, make friends and find your gifts.'

export const YOUTH_ACTIVITIES: { title: string; description: string }[] = [
  {
    title: 'Ablaze Choir',
    description: 'Our youth choir, and the team behind the annual Ablaze conference.',
  },
  {
    title: 'Heart to Heart',
    description: 'An annual relationships seminar on dating and courtship, looked at from a biblical point of view.',
  },
  {
    title: 'Acoustic Nights',
    description: 'Evenings of music and talent that are also a way of sharing the good news with our community.',
  },
]

export const YOUTH_CAMPUS = {
  title: 'NU Ablaze, on campus',
  body: 'Our university wing meets for weekly Bible fellowship at Northumbria University, about three miles from the church, with the aim of reaching universities across the country.',
}

/** True for the Ablaze Youth ministry itself, or any ministry ticked "youth". */
export const isYouthMinistry = (m: { slug?: string | null; isYouthMinistry?: boolean | null }) =>
  Boolean(m.isYouthMinistry) || m.slug === YOUTH_SLUG
