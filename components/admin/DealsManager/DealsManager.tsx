'use client'

import { FormEvent, useState } from 'react'
import styles from './DealsManager.module.css'

type Deal = {
  id: string
  clientName: string
  listingTitle: string
  dealValue: number
  commission: number
  currency: string
  closedAt: string
  transactionType: 'sale' | 'rent'
  notes?: string
}

type ListingOption = {
  id: string
  title: string
  price: number
}

type ClientOption = {
  id: string
  name: string
}

type Props = {
  initialDeals?: Deal[]
  listings: ListingOption[]
  clients: ClientOption[]
}

type FormValues = {
  clientId: string
  listingId: string
  dealValue: string
  commission: string
  closedAt: string
  notes: string
}

type ModalMode = 'create' | 'edit' | 'view'

const EMPTY_FORM: FormValues = {
  clientId: '',
  listingId: '',
  dealValue: '',
  commission: '',
  closedAt: new Date().toISOString().slice(0, 10),
  notes: '',
}

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function sortDeals(items: Deal[]): Deal[] {
  return [...items].sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
}

function toFormValues(deal: Deal, clients: ClientOption[], listings: ListingOption[]): FormValues {
  const clientMatch = clients.find((c) => c.name === deal.clientName)
  const listingMatch = listings.find((l) => l.title === deal.listingTitle)
  return {
    clientId: clientMatch?.id ?? '',
    listingId: listingMatch?.id ?? '',
    dealValue: String(deal.dealValue),
    commission: String(deal.commission),
    closedAt: deal.closedAt,
    notes: deal.notes ?? '',
  }
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m16.5 3.5 4 4L8 20l-5 1 1-5 12.5-12.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function DealsManager({ initialDeals = [], listings, clients }: Props) {
  const [deals, setDeals] = useState<Deal[]>(() => sortDeals(initialDeals))
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [formValues, setFormValues] = useState<FormValues>(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Deal | null>(null)

  const updateField = (key: keyof FormValues, value: string) => {
    setFormValues((current) => ({ ...current, [key]: value }))
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

  const resetForm = () => {
    setFormValues(EMPTY_FORM)
    setFieldErrors({})
    setSubmitError(null)
    setEditingDeal(null)
  }

  const openCreate = () => {
    resetForm()
    setModalMode('create')
  }

  const openView = (deal: Deal) => {
    setEditingDeal(deal)
    setFormValues(toFormValues(deal, clients, listings))
    setModalMode('view')
  }

  const openEdit = (deal: Deal) => {
    setEditingDeal(deal)
    setFormValues(toFormValues(deal, clients, listings))
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode('create')
    resetForm()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const errors: Record<string, string> = {}
    if (!formValues.clientId) errors.clientId = 'Select a client.'
    if (!formValues.listingId) errors.listingId = 'Select a property.'
    if (!formValues.dealValue.trim() || Number.isNaN(Number(formValues.dealValue))) {
      errors.dealValue = 'Enter a valid deal value.'
    }
    if (!formValues.commission.trim() || Number.isNaN(Number(formValues.commission))) {
      errors.commission = 'Enter a valid commission.'
    }
    if (!formValues.closedAt) errors.closedAt = 'Select a date.'

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setSubmitError(null)

    const selectedClient = clients.find((c) => c.id === formValues.clientId)
    const selectedListing = listings.find((l) => l.id === formValues.listingId)

    const dealData: Deal = {
      id: editingDeal?.id ?? `deal-${crypto.randomUUID()}`,
      clientName: selectedClient?.name ?? 'Unknown',
      listingTitle: selectedListing?.title ?? 'Unknown',
      dealValue: Number(formValues.dealValue),
      commission: Number(formValues.commission),
      currency: 'USD',
      closedAt: formValues.closedAt,
      transactionType: 'sale',
      notes: formValues.notes.trim() || undefined,
    }

    setTimeout(() => {
      setDeals((current) => {
        const exists = current.some((d) => d.id === dealData.id)
        if (exists) {
          return sortDeals(current.map((d) => (d.id === dealData.id ? dealData : d)))
        }
        return sortDeals([dealData, ...current])
      })
      setSubmitting(false)
      closeModal()
    }, 300)
  }

  const handleDelete = (deal: Deal) => {
    setDeals((current) => current.filter((d) => d.id !== deal.id))
    setDeleteConfirm(null)
  }

  const totalCommission = deals.reduce((sum, deal) => sum + deal.commission, 0)

  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarInfo}>
          <p className={styles.toolbarEyebrow}>Deals manager</p>
          <p className={styles.toolbarText}>
            {deals.length === 0
              ? 'No deals recorded yet.'
              : `${deals.length} deal${deals.length === 1 ? '' : 's'} · ${formatCurrency(totalCommission)} total commission`}
          </p>
        </div>
        <button type="button" className={styles.primaryButton} onClick={openCreate}>
          + New deal
        </button>
      </div>

      {deals.length === 0 ? (
        <div className={styles.emptyCard}>
          <h2 className={styles.emptyTitle}>No deals yet</h2>
          <p className={styles.emptyText}>Record your first deal to start tracking commissions.</p>
        </div>
      ) : (
        <div className={styles.dealsTable}>
          <div className={styles.tableHeader}>
            <span>Date</span>
            <span>Client</span>
            <span>Property</span>
            <span className={styles.alignRight}>Value</span>
            <span className={styles.alignRight}>Commission</span>
            <span className={styles.actionsHeader}>Actions</span>
          </div>

          {deals.map((deal) => (
            <div key={deal.id} className={styles.tableRow}>
              <span className={styles.tableDate}>{formatDate(deal.closedAt)}</span>
              <span className={styles.tableClient}>{deal.clientName}</span>
              <span className={styles.tableProperty}>{deal.listingTitle}</span>
              <span className={`${styles.alignRight} ${styles.tableValue}`}>
                {formatCurrency(deal.dealValue, deal.currency)}
              </span>
              <span className={`${styles.alignRight} ${styles.tableCommission}`}>
                {formatCurrency(deal.commission)}
              </span>

              <span className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => openView(deal)}
                  aria-label={`View deal with ${deal.clientName}`}
                >
                  <EyeIcon />
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => openEdit(deal)}
                  aria-label={`Edit deal with ${deal.clientName}`}
                >
                  <EditIcon />
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setDeleteConfirm(deal)}
                  aria-label={`Delete deal with ${deal.clientName}`}
                >
                  <TrashIcon />
                </button>
              </span>

            </div>
          ))}
        </div>
      )}

      {modalMode !== 'create' && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="deal-modal-title">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <p className={styles.modalEyebrow}>
                {modalMode === 'view' ? 'Deal details' : modalMode === 'edit' ? 'Edit deal' : 'New deal'}
              </p>
              <h2 id="deal-modal-title" className={styles.modalTitle}>
                {modalMode === 'view' ? `${formatCurrency(editingDeal?.dealValue ?? 0)} deal` : 'Record a closed deal'}
              </h2>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Client</span>
                <select
                  className={styles.select}
                  value={formValues.clientId}
                  onChange={(e) => updateField('clientId', e.target.value)}
                  disabled={modalMode === 'view' || submitting}
                >
                  <option value="">Select a client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {fieldErrors.clientId && <span className={styles.fieldError}>{fieldErrors.clientId}</span>}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Property</span>
                <select
                  className={styles.select}
                  value={formValues.listingId}
                  onChange={(e) => handleListingChange(e.target.value)}
                  disabled={modalMode === 'view' || submitting}
                >
                  <option value="">Select a property</option>
                  {listings.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
                {fieldErrors.listingId && <span className={styles.fieldError}>{fieldErrors.listingId}</span>}
              </label>

              <div className={styles.grid}>
                <label className={styles.field}>
                  <span className={styles.label}>Deal value (USD)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.dealValue}
                    onChange={(e) => updateField('dealValue', e.target.value)}
                    placeholder="e.g. 100000"
                    readOnly={modalMode === 'view'}
                    disabled={submitting}
                  />
                  {fieldErrors.dealValue && <span className={styles.fieldError}>{fieldErrors.dealValue}</span>}
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Commission (USD)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.commission}
                    onChange={(e) => updateField('commission', e.target.value)}
                    placeholder="e.g. 3000"
                    readOnly={modalMode === 'view'}
                    disabled={submitting}
                  />
                  {fieldErrors.commission && <span className={styles.fieldError}>{fieldErrors.commission}</span>}
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Closed date</span>
                <input
                  className={styles.input}
                  type="date"
                  value={formValues.closedAt}
                  onChange={(e) => updateField('closedAt', e.target.value)}
                  readOnly={modalMode === 'view'}
                  disabled={submitting}
                />
                {fieldErrors.closedAt && <span className={styles.fieldError}>{fieldErrors.closedAt}</span>}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Notes (optional)</span>
                <textarea
                  className={styles.textarea}
                  value={formValues.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Any notes about this deal"
                  rows={3}
                  readOnly={modalMode === 'view'}
                  disabled={submitting}
                />
              </label>

              {submitError && <p className={styles.errorBanner}>{submitError}</p>}

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={closeModal} disabled={submitting}>
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button type="submit" className={styles.primaryButton} disabled={submitting}>
                    {submitting ? 'Saving…' : modalMode === 'edit' ? 'Save changes' : 'Record deal'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="delete-deal-title">
          <div className={styles.modalCard}>
            <p className={styles.modalEyebrow}>Delete deal</p>
            <h2 id="delete-deal-title" className={styles.modalTitle}>
              {deleteConfirm.clientName}
            </h2>
            <p className={styles.modalText}>
              This will permanently remove this deal from the list. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button type="button" className={styles.dangerButton} onClick={() => handleDelete(deleteConfirm)}>
                Delete deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
