'use client'

import { useActionState, useState } from 'react'

import { submitBookOrder, type FormState } from '@/app/(frontend)/connect/actions'
import { MAX_BOOKS_PER_ORDER, totalDisplay } from '@/lib/books'
import { ConsentNotice } from './ConsentNotice'
import { Honeypot } from './Honeypot'

const initialState: FormState = { status: 'idle' }
const label = 'mb-1 block text-sm font-medium text-ink'

// A red star after the name of a question that has to be answered.
const Star = () => (
  <span className="text-red-600" aria-hidden="true">
    {' '}
    *
  </span>
)

/**
 * Ordering a book: the visitor says which one and how many, and collects it at church. No payment is taken on the
 * website; the office gets the order by email and replies when it is ready.
 */
export function BookOrderForm({
  books,
  defaultBookId,
}: {
  books: { id: number; title: string; price: string | null }[]
  defaultBookId?: number
}) {
  const [state, formAction, pending] = useActionState(submitBookOrder, initialState)
  const [bookId, setBookId] = useState(String(defaultBookId ?? books[0]?.id ?? ''))
  const [quantity, setQuantity] = useState(1)
  const chosen = books.find((b) => String(b.id) === bookId)
  const total = chosen ? totalDisplay(chosen.price, quantity) : null

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-border bg-brand-50 p-8" role="status">
        <p className="font-serif text-xl font-semibold text-brand-700">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <Honeypot />
      <p className="text-xs text-ink-muted">
        <span className="text-red-600" aria-hidden="true">
          *
        </span>{' '}
        Required
      </p>
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="bo-book" className={label}>
            Book
            <Star />
          </label>
          <select id="bo-book" name="bookId" required className="input" value={bookId} onChange={(e) => setBookId(e.target.value)}>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
                {book.price ? ` (${book.price})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bo-qty" className={label}>
            How many
            <Star />
          </label>
          <select id="bo-qty" name="quantity" required className="input" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
            {Array.from({ length: MAX_BOOKS_PER_ORDER }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
      {total && (
        <p className="text-sm font-medium text-ink" aria-live="polite">
          Total: {total}
        </p>
      )}
      <div>
        <label htmlFor="bo-name" className={label}>
          Your name
          <Star />
        </label>
        <input id="bo-name" name="name" type="text" required autoComplete="name" className="input" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="bo-email" className={label}>
            Email
            <Star />
          </label>
          <input id="bo-email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label htmlFor="bo-phone" className={label}>
            Phone (optional)
          </label>
          <input id="bo-phone" name="phone" type="tel" autoComplete="tel" className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="bo-notes" className={label}>
          Anything we should know (optional)
        </label>
        <textarea id="bo-notes" name="message" rows={3} className="input" />
      </div>
      <p className="text-sm text-ink-muted">You will collect your book at church. We will contact you when it is ready.</p>
      <ConsentNotice marked />
      {state.status === 'error' && (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Sending…' : 'Place my order'}
      </button>
    </form>
  )
}
