import type { Payload } from 'payload'

import { isYouthMinistry } from '@/lib/youthMinistry'

type Item = { area: string; text: string; href: string; cta: string }

const names = (list: string[], max = 6) =>
  list.length <= max ? list.join(', ') : `${list.slice(0, max).join(', ')} and ${list.length - max} more`

/**
 * "To complete" panel at the top of the admin dashboard, for Admin / Super Admin
 * only. It works out what is still missing from the live content and settings, so
 * it shortens as things are filled in and shows nothing once everything is done.
 * Nothing here is public.
 */
export async function ContentToDoPanel({ payload, user }: { payload?: Payload; user?: { role?: string | null } | null }) {
  if (!payload || (user?.role !== 'admin' && user?.role !== 'super-admin')) return null

  const items: Item[] = []
  const add = (area: string, text: string, href: string, cta = 'Open') => items.push({ area, text, href, cta })

  // --- Settings and the way the site is connected ---------------------------------------------
  const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)
  const sg = settings?.safeguarding

  if (!process.env.RESEND_API_KEY) {
    add(
      'Email',
      process.env.RESEND_API
        ? 'No emails are being sent. The key in Vercel is named RESEND_API, but the site reads RESEND_API_KEY: rename it, then verify the sending domain in Resend.'
        : 'No emails are being sent (no RESEND_API_KEY in Vercel). Form notifications and safeguarding alerts will not reach anyone.',
      '',
      'In Vercel',
    )
  }
  if (!process.env.NOTIFY_EMAIL) {
    add('Email', 'NOTIFY_EMAIL is not set in Vercel, so there is no address for new-form notifications to go to.', '', 'In Vercel')
  }
  if (sg?.enabled && !sg.leadEmail && !sg.alertEmail) {
    add(
      'Safeguarding',
      'The Safeguarding page is switched on but there is no email for the Safeguarding Lead or for alerts, so a new concern would be saved without anyone being told.',
      '/admin/globals/settings',
      'Open Settings',
    )
  } else if (sg?.enabled && !sg.deputyName) {
    add('Safeguarding', 'Add a Deputy Safeguarding Lead.', '/admin/globals/settings', 'Open Settings')
  }
  if (!sg?.enabled) {
    add('Safeguarding', 'The Safeguarding page is switched off. Review it, add the lead details, then tick "Show the Safeguarding page".', '/admin/globals/settings', 'Open Settings')
  }
  if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test')) {
    add('Giving', 'Online giving is in test mode: only Stripe test cards work. Switch to live keys, add the production webhook and make one real test gift before launch.', '', 'In Vercel')
  } else if (!process.env.STRIPE_SECRET_KEY) {
    add('Giving', 'Stripe is not connected, so the Donate page cannot take payments.', '', 'In Vercel')
  }
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_WEBHOOK_SECRET) {
    add(
      'Giving',
      'No Stripe webhook secret (STRIPE_WEBHOOK_SECRET) in Vercel. Until the webhook is added in Stripe and its secret saved here, gifts stay "pending" and no thank-you or confirmation emails are sent.',
      '',
      'In Vercel',
    )
  }
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    add('Analytics', 'Google Analytics is not connected (no NEXT_PUBLIC_GA_MEASUREMENT_ID in Vercel).', '', 'In Vercel')
  }
  if (!settings?.socialLinks?.youtubeChannelId) {
    add('Settings', 'The YouTube channel ID is not set, so the live player, the Live button and the sermon feed are off.', '/admin/globals/settings', 'Open Settings')
  }
  if (!settings?.contactEmail || !settings?.contactPhone) {
    add('Settings', 'Add the church contact email and phone number.', '/admin/globals/settings', 'Open Settings')
  }

  // --- Welfare & Support -----------------------------------------------------------------------
  const welfare = settings?.welfareSupport
  if (!welfare?.services?.length) {
    add('Welfare', 'No support services are listed on the Welfare & Support page. Add the help the church really offers (Settings, Welfare & Support page) and the page shows it.', '/admin/globals/settings', 'Open Settings')
  }
  if (!welfare?.replyTime?.trim()) {
    add('Welfare', 'No reply time is set, so the confirmation promises none. Decide how quickly the welfare team replies, and enter it in Settings (Welfare & Support page).', '/admin/globals/settings', 'Open Settings')
  }
  if (!settings?.formEmails?.welfare?.trim()) {
    add('Welfare', 'No welfare team email is set (Settings, Form emails). Until then, alerts about new welfare requests go to NOTIFY_EMAIL.', '/admin/globals/settings', 'Open Settings')
  }

  // --- Ministries ------------------------------------------------------------------------------
  const ministries = (await payload.find({ collection: 'ministries', limit: 200, depth: 0, sort: 'name' }).catch(() => null))?.docs ?? []
  const kids = ministries.find((m) => m.isChildrensMinistry)
  if (!kids) {
    add("Children's Ministry", 'No ministry is marked as the Children’s Ministry, so the consent, volunteer and registration forms are not shown anywhere.', '/admin/collections/ministries', 'Open Ministries')
  } else {
    const link = `/admin/collections/ministries/${kids.id}`
    if (!kids.ageGroups?.length) {
      add("Children's Ministry", 'The page is showing standard wording for Pearls, Rubies, Diamond and Gold (UK Early Years and Key Stage groups). Check it matches what each class really does, or enter your own under Age Groups.', link, 'Open')
    } else if (kids.ageGroups.some((g) => !g.description)) {
      add("Children's Ministry", 'Some classes have no description. Write a sentence on what each one does.', link, 'Open')
    }
    if (!kids.meetingTimes?.length) {
      add("Children's Ministry", 'Meeting times: the page is using the Sunday school and children’s service times from the website. Enter them to confirm or change them.', link, 'Open')
    }
    if (!kids.contactEmail && !kids.contactPhone) {
      add("Children's Ministry", 'The page is sending parents to the church office. Add a contact email or phone number for the children’s team itself.', link, 'Open')
    }
  }
  const youth = ministries.find((m) => isYouthMinistry(m))
  if (youth) {
    const link = `/admin/collections/ministries/${youth.id}`
    if (!youth.messageEmail && !youth.contactEmail) {
      add('Youth (Ablaze)', 'Add the youth coordinator’s email under "Email for messages". It is never shown on the site; it is where the "Message the youth team" form on the Ablaze page sends messages. Until then they are only saved here (and emailed to NOTIFY_EMAIL if that is set).', link, 'Open')
    }
    if (!youth.meetingTimes?.length || !youth.ageGroups?.length) {
      add('Youth (Ablaze)', 'Add the meeting times and age range. The church’s Ablaze page does not list them, so none are shown yet.', link, 'Open')
    }
    if (!youth.activities?.length) {
      add('Youth (Ablaze)', 'The page is showing the church’s Ablaze activities (Choir, Heart to Heart, Acoustic Nights). Enter your own under "What we do" to confirm or add to them.', link, 'Open')
    }
  }
  const others = ministries.filter((m) => !m.isChildrensMinistry && m !== youth)
  const noLeader = others.filter((m) => !m.leaderName).map((m) => m.name)
  if (noLeader.length) add('Ministries', `${noLeader.length} ministries have no leader named: ${names(noLeader)}.`, '/admin/collections/ministries', 'Open Ministries')
  const noTimes = others.filter((m) => !m.meetingTimes?.length).map((m) => m.name)
  if (noTimes.length) add('Ministries', `${noTimes.length} ministries have no meeting times: ${names(noTimes)}.`, '/admin/collections/ministries', 'Open Ministries')

  // --- Homegroups ------------------------------------------------------------------------------
  const homegroups = (await payload.find({ collection: 'homegroups', limit: 200, depth: 0, sort: 'area' }).catch(() => null))?.docs ?? []
  const noGroupLeader = homegroups.filter((g) => !g.leaderName).map((g) => g.area)
  if (noGroupLeader.length) add('Homegroups', `${noGroupLeader.length} homegroups have no leader named: ${names(noGroupLeader)}.`, '/admin/collections/homegroups', 'Open Homegroups')

  // --- Events, sermons, resources, news and missions -------------------------------------------
  const events = (await payload.find({ collection: 'events', limit: 200, depth: 0, sort: '-startDate' }).catch(() => null))?.docs ?? []
  const drafts = events.filter((e) => e._status === 'draft').map((e) => e.title)
  if (drafts.length) add('Events', `${drafts.length} event${drafts.length === 1 ? ' is' : 's are'} still a draft and hidden from the public: ${names(drafts)}. Publish or delete.`, '/admin/collections/events', 'Open Events')
  const noTime = events.filter((e) => e._status !== 'draft' && (!e.timeLabel || !e.location)).map((e) => e.title)
  if (noTime.length) add('Events', `These events have no time or location, so their cards show only the date: ${names(noTime)}.`, '/admin/collections/events', 'Open Events')

  const sermons = (await payload.find({ collection: 'sermons', limit: 200, depth: 0 }).catch(() => null))?.docs ?? []
  const emptySermons = sermons.filter((s) => !s.videoUrl && !s.audioUrl).map((s) => s.title)
  if (emptySermons.length) add('Sermons', `No video or audio link on: ${names(emptySermons)}. Add one, or delete the sample.`, '/admin/collections/sermons', 'Open Sermons')

  const resources = (await payload.find({ collection: 'resources', limit: 200, depth: 0 }).catch(() => null))?.docs ?? []
  if (!resources.some((r) => r.type === 'start-here')) {
    add('Resources', 'No "Start here" resources yet. Write a few plain-language pieces for people new to faith (type: Start Here) and they appear on the Resources page automatically.', '/admin/collections/resources', 'Open Resources')
  }
  if (!resources.some((r) => r.file)) {
    add('Resources', 'No resource has a downloadable file yet. Upload PDFs (e-books, reading plans, ministry forms) so visitors can download them.', '/admin/collections/resources', 'Open Resources')
  }

  const [news, projects, missionaries] = await Promise.all([
    payload.count({ collection: 'news' }).catch(() => ({ totalDocs: 0 })),
    payload.count({ collection: 'mission-projects' }).catch(() => ({ totalDocs: 0 })),
    payload.count({ collection: 'missionaries' }).catch(() => ({ totalDocs: 0 })),
  ])
  if (!news.totalDocs) add('News', 'No news posts yet. The News page and the home page strip are empty until you add some.', '/admin/collections/news', 'Open News')
  if (!projects.totalDocs) add('Missions', 'No mission projects yet. Add them so the Missions page has something to show.', '/admin/collections/mission-projects', 'Open Mission Projects')
  if (!missionaries.totalDocs) add('Missions', 'No missionaries yet.', '/admin/collections/missionaries', 'Open Missionaries')

  return (
    <section
      aria-labelledby="todo-heading"
      style={{
        marginBottom: 32,
        padding: 20,
        border: '1px solid var(--theme-warning-500, #d97706)',
        borderRadius: 'var(--style-radius-m, 8px)',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <h2 id="todo-heading" style={{ margin: 0, fontSize: 18 }}>
        To complete {items.length > 0 ? `(${items.length})` : ''}
      </h2>
      <p style={{ margin: '4px 0 12px', opacity: 0.75, fontSize: 14 }}>
        Only admins see this. It checks the live content and settings, so each line disappears once it is done.
      </p>
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 14 }}>Nothing outstanding. Everything checked is filled in.</p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
          {items.map((item, i) => (
            <li
              key={i}
              style={{ display: 'grid', gridTemplateColumns: '130px 1fr auto', gap: 12, alignItems: 'baseline', fontSize: 14 }}
            >
              <strong>{item.area}</strong>
              <span>{item.text}</span>
              {item.href ? (
                <a href={item.href} style={{ whiteSpace: 'nowrap' }}>
                  {item.cta} &rarr;
                </a>
              ) : (
                <span style={{ whiteSpace: 'nowrap', opacity: 0.6 }}>{item.cta}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
