'use client'

import { useState } from 'react'
import styles from './InquiryForm.module.css'

interface Props {
  nameLabel: string
  phoneLabel: string
  messageLabel: string
  submitLabel: string
  successMessage: string
  listingTitle?: string
}

export default function InquiryForm({
  nameLabel,
  phoneLabel,
  messageLabel,
  submitLabel,
  successMessage,
  listingTitle,
}: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // Placeholder — real API submission comes later
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 600)
  }

  if (submitted) {
    return <p className={styles.success}>{successMessage}</p>
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {listingTitle && (
        <input type="hidden" name="listing" value={listingTitle} />
      )}
      <label className={styles.label}>
        {nameLabel}
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          className={styles.input}
        />
      </label>
      <label className={styles.label}>
        {phoneLabel}
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          className={styles.input}
        />
      </label>
      <label className={styles.label}>
        {messageLabel}
        <textarea
          name="message"
          required
          rows={4}
          className={styles.textarea}
        />
      </label>
      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? '…' : submitLabel}
      </button>
    </form>
  )
}
