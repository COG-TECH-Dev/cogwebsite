import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { StepOfFaithForm } from '@/components/site/StepOfFaithForm'

export const metadata: Metadata = { title: 'Take a Step of Faith' }

// Content ported from the church's own previous site (the "So You Want to Be
// a Christian" and "Take a Step of Faith" pages) rather than invented here —
// this is doctrinally sensitive content, so it's worth a pastoral review
// before relying on it, even though it's the church's own existing wording.
export default function NextStepsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Connect"
        title="Take a Step of Faith"
        description="Whatever brought you here today, we're glad you came. Maybe you're trusting Jesus for the first time, coming back after time away, or just want to know more before deciding. There's no wrong reason to be on this page."
      />
      <Container className="max-w-2xl py-16">
        <Reveal className="prose prose-neutral max-w-none">
          <h2 className="font-serif text-2xl font-semibold text-brand-700">A Journey Worth Starting</h2>
          <p className="text-ink-muted">
            Becoming a Christian starts with a simple but life-changing decision: believing that Jesus Christ died
            for your sins and rose again, and choosing to follow Him. Wherever you are on your journey, whatever
            your past, God&apos;s love and forgiveness are available to you today. If you have never given your
            life to Christ, or you want to recommit your life to Him, you can do that right now through a simple
            prayer of faith. You don&apos;t need to be in a church building or wait for a special moment — all
            that&apos;s required is a sincere heart.
          </p>
          <h3 className="font-serif text-xl font-semibold text-brand-700">A Prayer to Begin Your Journey</h3>
          <p className="text-ink-muted">If you&apos;re ready to give your life to Christ, pray this simply and sincerely, wherever you are:</p>
          <blockquote className="border-l-4 border-gold-400 pl-4 italic text-ink">
            Lord Jesus, I believe You are the Son of God, that You died for my sins and rose again. I confess my
            need for You and I turn from my old way of life. Come into my heart, forgive me, and be my Lord and
            Savior from this day forward. Thank You for Your love and for the gift of new life. Amen.
          </blockquote>
          <p className="text-ink-muted">
            If you prayed that prayer and meant it, you have taken the most important step of your life. This is
            not the end, it&apos;s the beginning. Reach out to us so we can walk this journey with you.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <p className="mb-6 text-ink-muted">
            Take a moment to respond below. Sharing your details is completely optional; if you&apos;d rather stay
            anonymous for now, that&apos;s okay too. Either way, we&apos;ll show you a few simple next steps as
            soon as you submit.
          </p>
          <StepOfFaithForm />
        </Reveal>
      </Container>
    </div>
  )
}
