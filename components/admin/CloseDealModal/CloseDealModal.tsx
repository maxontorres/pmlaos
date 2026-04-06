'use client'

import { FormEvent, useState } from 'react'
import styles from './CloseDealModal.module.css'

type ListingOption = {
  id: string
  title: string
  price: number
}

type Props = {
  clientId: string
  clientName: string
  linkedListings: ListingOption[]
  allListings: ListingOption[]
  onClose: () => void
  onSuccess: () => void
}

type FormValues = {
  listingId: string
  dealValue: string
  commission: string
  closedAt: string
  notes: string
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_FORM: FormValues = {
  listingId: '',
  dealValue: '',
  commission: '',
  closedAt: todayIso(),
  notes: '',
}

export default function CloseDealModal({
  clientId,
  clientName,
  linkedListings,
  allListings,
  onClose,
  onSuccess,
}: Props) {
  const listings = linkedListings.length > 0 ? linkedListings : allListings
  const usingFallback = linkedListings.length === 0

  const [values, setValues] = useState<FormValues>(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const updateField = (key: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const handleListingChange = (listingId: string) => {
    updateField('listingId', listingId)
    const match = listings.find((l) => l.id === listingId)
    if (match && match.price > 0) {
      updateField('dealValue', String(match.price))
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Record<string, string> = {}
    if (!values.listingId) nextErrors.listingId = 'Please select a property.'
    if (!values.dealValue.trim() || Number.isNaN(Number(values.dealValue))) {
      nextErrors.dealValue = 'Deal value must be a valid number.'
    }
    if (!values.commission.trim() || Number.isNaN(Number(values.commission))) {
      nextErrors.commission = 'Commission must be a valid number.'
    }
    if (!values.closedAt) nextErrors.closedAt = 'Closed date is required.'

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          listingId: values.listingId,
          dealValue: Number(values.dealValue),
          commission: Number(values.commission),
          closedAt: values.closedAt,
          notes: values.notes.trim() || null,
        }),
      })

      if (res.status === 201) {
        onSuccess()
        onClose()
        return
      }

      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Something went wrong. Please try again.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="close-deal-title">
      <div className={styles.card}>
        <div>
          <p className={styles.eyebrow}>Close deal</p>
          <h2 id="close-deal-title" className={styles.title}>{clientName}</h2>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Property</span>
            {usingFallback ? (
              <p className={styles.hint}>No linked properties — showing all listings.</p>
            ) : null}
            <select
              className={styles.select}
              value={values.listingId}
              onChange={(e) => handleListingChange(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a property</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
            {fieldErrors.listingId ? <span className={styles.fieldError}>{fieldErrors.listingId}</span> : null}
          </label>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span className={styles.label}>Deal value (USD)</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={values.dealValue}
                onChange={(e) => updateField('dealValue', e.target.value)}
                placeholder="e.g. 100000"
                disabled={loading}
              />
              {fieldErrors.dealValue ? <span className={styles.fieldError}>{fieldErrors.dealValue}</span> : null}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Commission (USD)</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={values.commission}
                onChange={(e) => updateField('commission', e.target.value)}
                placeholder="e.g. 3000"
                disabled={loading}
              />
              {fieldErrors.commission ? <span className={styles.fieldError}>{fieldErrors.commission}</span> : null}
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Closed date</span>
            <input
              className={styles.input}
              type="date"
              value={values.closedAt}
              onChange={(e) => updateField('closedAt', e.target.value)}
              disabled={loading}
            />
            {fieldErrors.closedAt ? <span className={styles.fieldError}>{fieldErrors.closedAt}</span> : null}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Notes (optional)</span>
            <textarea
              className={styles.textarea}
              value={values.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any notes about this deal"
              rows={3}
              disabled={loading}
            />
          </label>

          {error ? <p className={styles.errorBanner}>{error}</p> : null}

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={loading}>
              {loading ? 'Saving…' : 'Close deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
