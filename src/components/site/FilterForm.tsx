'use client'

import { useRouter } from 'next/navigation'
import { useTransition, type FormEvent, type ChangeEvent, type ReactNode } from 'react'

/**
 * A search / filter form that stays where it is. It is still a plain GET form (so it works without JavaScript),
 * but with JavaScript the results change without the page jumping back to the top, and choosing something in a
 * drop-down applies straight away, with no separate Filter button press.
 */
export function FilterForm({
  action,
  children,
  className,
  role,
  'aria-label': ariaLabel,
}: {
  action: string
  children: ReactNode
  className?: string
  role?: string
  'aria-label'?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function go(form: HTMLFormElement) {
    const qs = new URLSearchParams()
    for (const [key, value] of new FormData(form).entries()) {
      if (typeof value === 'string' && value.trim() !== '') qs.set(key, value.trim())
    }
    const query = qs.toString()
    startTransition(() => router.push(query ? `${action}?${query}` : action, { scroll: false }))
  }

  return (
    <form
      action={action}
      method="get"
      role={role}
      aria-label={ariaLabel}
      aria-busy={pending}
      className={className}
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        go(e.currentTarget)
      }}
      onChange={(e: ChangeEvent<HTMLFormElement>) => {
        if (e.target instanceof HTMLSelectElement) go(e.currentTarget)
      }}
    >
      {children}
    </form>
  )
}
