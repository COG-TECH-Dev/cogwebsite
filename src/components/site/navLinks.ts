export type NavLink = {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

// Primary site structure — mirrors the collections/routes built in Phase 3.
// Settings.nav (editable in the CMS) is for extra one-off links, not this
// core structure, since changing top-level sections is an IA decision.
export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Vision & Mission', href: '/about/vision-mission' },
      { label: 'Tenets', href: '/about/tenets' },
      { label: 'History', href: '/about/history' },
      { label: 'Leadership', href: '/about/leadership' },
    ],
  },
  { label: 'Ministries', href: '/ministries' },
  { label: 'Programmes', href: '/programmes' },
  {
    label: 'Media',
    href: '/media',
    children: [
      { label: 'Sermons', href: '/media/sermons' },
      { label: 'Gallery', href: '/media/gallery' },
      { label: 'COG TV', href: '/media/cog-tv' },
      { label: 'COG Grand Radio', href: '/media/cog-grand-radio' },
    ],
  },
  {
    label: 'Give',
    href: '/give',
    children: [
      { label: 'Give Online', href: '/give' },
      { label: 'Bookstore', href: '/give/bookstore' },
    ],
  },
  { label: 'Resources', href: '/resources' },
  {
    label: 'Connect',
    href: '/connect',
    children: [
      { label: 'Prayer Request', href: '/connect/prayer-request' },
      { label: 'Contact Us', href: '/connect/contact' },
      { label: 'Appointments', href: '/connect/appointments' },
      { label: 'Membership', href: '/connect/membership' },
    ],
  },
]
