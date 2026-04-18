'use client'

import { FormEvent, useState } from 'react'
import CloseDealModal from '@/components/admin/CloseDealModal/CloseDealModal'
import DeleteConfirmModal from '@/components/admin/shared/DeleteConfirmModal'
import { EyeIcon, EditIcon, TrashIcon } from '@/components/admin/shared/AdminIcons'
import styles from './ClientsManager.module.css'

type Nationality = string
type Gender = string

type ClientRecord = {
  id: string
  name: string
  whatsapp: string
  email?: string | null
  nationality?: string | null
  gender?: string | null
  interestType: string
  budgetMin?: number | null
  budgetMax?: number | null
  status: string
  source: string
  notes?: string | null
  interestedPropertyIds: string[]
  assignedToId?: string | null
  speakLaoThai?: boolean
  speakEnglish?: boolean
  createdAt?: string | Date
}

type FormValues = {
  name: string
  whatsapp: string
  email: string
  nationality: string
  gender: Gender
  interestType: ClientRecord['interestType']
  budgetMin: string
  budgetMax: string
  status: ClientRecord['status']
  source: ClientRecord['source']
  notes: string
  interestedProperties: string[]
  assignedToName: string
  speakLaoThai: boolean
  speakEnglish: boolean
}

const nationalities: Nationality[] = ['Lao', 'Thai', 'Vietnamese', 'Chinese', 'International']


const EMPTY_FORM: FormValues = {
  name: '',
  whatsapp: '',
  email: '',
  nationality: 'Lao',
  gender: 'male',
  interestType: 'any',
  budgetMin: '',
  budgetMax: '',
  status: 'new',
  source: 'direct',
  notes: '',
  interestedProperties: [],
  assignedToName: '',
  speakLaoThai: false,
  speakEnglish: false,
}

function sortClients(items: ClientRecord[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

function toFormValues(client: ClientRecord, activeUsers: Array<{ id: string; name: string }> = []): FormValues {
  const assignedAgent = client.assignedToId 
    ? activeUsers.find(u => u.id === client.assignedToId)
    : null

  return {
    name: client.name ?? '',
    whatsapp: client.whatsapp ?? '',
    email: client.email ?? '',
    nationality: client.nationality ?? 'Lao',
    gender: client.gender ?? 'male',
    interestType: client.interestType ?? 'any',
    budgetMin: client.budgetMin == null ? '' : String(client.budgetMin),
    budgetMax: client.budgetMax == null ? '' : String(client.budgetMax),
    status: client.status ?? 'new',
    source: client.source ?? 'direct',
    notes: client.notes ?? '',
    interestedProperties: client.interestedPropertyIds ?? [],
    assignedToName: assignedAgent?.name ?? '',
    speakLaoThai: client.speakLaoThai ?? false,
    speakEnglish: client.speakEnglish ?? false,
  }
}

function formatBudget(client: ClientRecord) {
  if (client.budgetMin == null && client.budgetMax == null) return 'Budget not set'

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  if (client.budgetMin != null && client.budgetMax != null) {
    return `${formatter.format(client.budgetMin)} - ${formatter.format(client.budgetMax)}`
  }

  if (client.budgetMin != null) return `From ${formatter.format(client.budgetMin)}`
  return `Up to ${formatter.format(client.budgetMax ?? 0)}`
}

function formatInterest(value: ClientRecord['interestType']) {
  const label = value.replace(/_/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

type Props = {
  initialClients?: ClientRecord[]
  activeUsers?: Array<{ id: string; name: string }>
  listings?: Array<{ id: string; titleEn: string; price: any; transaction: any }>
  userRole?: string
}

export default function ClientsManager({ 
  initialClients = [], 
  activeUsers = [], 
  listings = [], 
  userRole 
}: Props) {
  const [clients, setClients] = useState<ClientRecord[]>(() => sortClients(initialClients))
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'view'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [propertySearch, setPropertySearch] = useState('')
  const [formValues, setFormValues] = useState<FormValues>(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [clientPendingDelete, setClientPendingDelete] = useState<ClientRecord | null>(null)
  const [dealClient, setDealClient] = useState<ClientRecord | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  
  const listingOptions = listings.map(l => ({
    id: l.id,
    title: l.titleEn,
    price: Number(l.price),
    transaction: l.transaction as 'sale' | 'rent',
  }))

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredClients = clients.filter((client) => {
    if (!normalizedSearch) return true

    return [
      client.name,
      client.whatsapp,
      client.email ?? '',
    ].some((value) => value.toLowerCase().includes(normalizedSearch))
  })

  const updateField = (key: keyof FormValues, value: string | string[] | boolean) => {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }))
    setFieldErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const handleNationalityChange = (value: string) => {
    updateField('nationality', value)
  }

  const resetForm = () => {
    setFormValues(EMPTY_FORM)
    setFieldErrors({})
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setMode('create')
  }

  const openView = (client: ClientRecord) => {
    setFieldErrors({})
    setEditingId(client.id)
    setFormValues(toFormValues(client, activeUsers))
    setMode('view')
  }

  const openEdit = (client: ClientRecord) => {
    setFieldErrors({})
    setEditingId(client.id)
    setFormValues(toFormValues(client, activeUsers))
    setMode('edit')
  }

  const closeForm = () => {
    resetForm()
    setMode('list')
  }

  const closeDeleteModal = () => {
    setClientPendingDelete(null)
  }

  const toggleInterestedProperty = (id: string) => {
    setFormValues((current) => {
      const exists = current.interestedProperties.includes(id)
      const next = exists
        ? current.interestedProperties.filter((propertyId) => propertyId !== id)
        : [...current.interestedProperties, id]
      return { ...current, interestedProperties: next }
    })
  }

  const handleAddProperty = () => {
    const normalized = propertySearch.trim()
    if (!normalized) return

    const match = listingOptions.find((listing) => listing.title.toLowerCase() === normalized.toLowerCase())
    if (!match) return

    updateField('interestedProperties', [...new Set([...formValues.interestedProperties, match.id])])
    setPropertySearch('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextFieldErrors: Record<string, string> = {}

    if (!formValues.name.trim()) nextFieldErrors.name = 'Name is required.'
    if (!formValues.whatsapp.trim()) nextFieldErrors.whatsapp = 'WhatsApp number is required.'

    if (formValues.budgetMin.trim() && Number.isNaN(Number(formValues.budgetMin))) {
      nextFieldErrors.budgetMin = 'Budget must be a number.'
    }

    if (formValues.budgetMax.trim() && Number.isNaN(Number(formValues.budgetMax))) {
      nextFieldErrors.budgetMax = 'Budget must be a number.'
    }

    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) return

    const resolvedNationality: Nationality = nationalities.includes(formValues.nationality as Nationality)
      ? (formValues.nationality as Nationality)
      : 'International'

    const resolvedAssignedToId = activeUsers.find(
      (u) => u.name.toLowerCase() === formValues.assignedToName.trim().toLowerCase()
    )?.id ?? null

    const body = {
      name: formValues.name.trim(),
      whatsapp: formValues.whatsapp.trim(),
      email: formValues.email.trim() || null,
      nationality: resolvedNationality,
      gender: formValues.gender,
      interestType: formValues.interestType,
      budgetMin: formValues.budgetMin.trim() ? Number(formValues.budgetMin) : null,
      budgetMax: formValues.budgetMax.trim() ? Number(formValues.budgetMax) : null,
      status: formValues.status,
      source: formValues.source,
      notes: formValues.notes.trim() || null,
      assignedTo: resolvedAssignedToId,
      speakLaoThai: formValues.speakLaoThai,
      speakEnglish: formValues.speakEnglish,
      interestedPropertyIds: formValues.interestedProperties,
    }

    try {
      const res = editingId
        ? await fetch(`/api/clients/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })

      if (!res.ok) {
        setApiError('Failed to save client. Please try again.')
        return
      }

      const saved = await res.json()

      const nextClient: ClientRecord = {
        id: saved.id,
        name: body.name,
        whatsapp: body.whatsapp,
        email: body.email,
        nationality: body.nationality,
        gender: body.gender,
        interestType: body.interestType,
        budgetMin: body.budgetMin,
        budgetMax: body.budgetMax,
        status: body.status,
        source: body.source,
        notes: body.notes,
        interestedPropertyIds: [...formValues.interestedProperties],
        assignedToId: resolvedAssignedToId,
        speakLaoThai: body.speakLaoThai,
        speakEnglish: body.speakEnglish,
        createdAt: saved.createdAt,
      }

      setClients((current) => {
        const exists = current.some((client) => client.id === nextClient.id)
        const next = exists
          ? current.map((client) => (client.id === nextClient.id ? nextClient : client))
          : [...current, nextClient]
        return sortClients(next)
      })

      setApiError(null)
      closeForm()
    } catch {
      setApiError('Network error. Please try again.')
    }
  }

  const handleDelete = async (client: ClientRecord) => {
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
      if (!res.ok) {
        setApiError('Failed to delete client. Please try again.')
        closeDeleteModal()
        return
      }
      setClients((current) => current.filter((item) => item.id !== client.id))
      closeDeleteModal()
    } catch {
      setApiError('Network error. Please try again.')
      closeDeleteModal()
    }
  }

  return (
    <div className={styles.stack}>
      {apiError ? (
        <p className={`${styles.fieldError} ${styles.errorBanner}`} role="alert">{apiError}</p>
      ) : null}

      {mode === 'list' ? (
        <section className={styles.stack}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarIntro}>
              <p className={styles.toolbarEyebrow}>Clients manager</p>
              <p className={styles.toolbarText}>
                {filteredClients.length === 0
                  ? 'No matching clients.'
                  : `${filteredClients.length} client${filteredClients.length === 1 ? '' : 's'} in this preview list`}
              </p>
            </div>
            <button type="button" className={styles.primaryButton} onClick={openCreate}>
              New client
            </button>
          </div>

          <section className={styles.filtersPanel}>
            <label className={styles.searchField}>
              <span className={styles.searchLabel}>Search clients</span>
              <input
                type="search"
                className={styles.input}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, WhatsApp, or email"
              />
            </label>
          </section>

          {clients.length === 0 ? (
            <article className={styles.emptyCard}>
              <h2 className={styles.emptyTitle}>No clients yet</h2>
              <p className={styles.emptyText}>Create the first client to start tracking leads.</p>
            </article>
          ) : filteredClients.length === 0 ? (
            <article className={styles.emptyCard}>
              <h2 className={styles.emptyTitle}>No matching clients</h2>
              <p className={styles.emptyText}>Try another search term.</p>
            </article>
          ) : (
            <div className={styles.recordList}>
              {filteredClients.map((client) => (
                <article key={client.id} className={styles.recordCard}>
                  <div className={styles.recordTop}>
                    <div className={styles.recordBadgeRow}>
                      <span className={`${styles.pill} ${styles[client.status]}`}>{client.status}</span>
                      <span className={styles.secondaryPill}>{formatInterest(client.interestType)}</span>
                    </div>
                    <h2 className={styles.recordTitle}>{client.name}</h2>
                    <p className={styles.whatsappValue}>{client.whatsapp}</p>
                  </div>

                  {client.budgetMin != null || client.budgetMax != null ? (
                    <p className={styles.budgetLine}>{formatBudget(client)}</p>
                  ) : null}

                  <div className={styles.actionRow}>
                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.viewButton}`}
                      onClick={() => openView(client)}
                      aria-label={`View ${client.name}`}
                    >
                      <span className={styles.actionIcon}><EyeIcon /></span>
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.secondaryButton}`}
                      onClick={() => openEdit(client)}
                      aria-label={`Edit ${client.name}`}
                    >
                      <span className={styles.actionIcon}><EditIcon /></span>
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.dangerButton}`}
                      onClick={() => setClientPendingDelete(client)}
                      aria-label={`Delete ${client.name}`}
                    >
                      <span className={styles.actionIcon}><TrashIcon /></span>
                      <span>Delete</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.dealButton}
                    onClick={() => setDealClient(client)}
                  >
                    Close deal
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className={styles.formPanel}>
          <div className={styles.formHeader}>
            <button type="button" className={styles.backButton} onClick={closeForm}>
              Back
            </button>
            <div>
              <h2 className={styles.formTitle}>{mode === 'view' ? 'Client details' : mode === 'edit' ? 'Edit client' : 'New client'}</h2>
              {mode !== 'view' ? <p className={styles.formText}>Keep the client record short and easy to scan on mobile.</p> : null}
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {(() => {
              const isView = mode === 'view'
              return (
                <>
                  <label className={styles.field}>
                    <span className={styles.label}>Name</span>
                    <input
                      className={styles.input}
                      value={formValues.name}
                      onChange={(event) => updateField('name', event.target.value)}
                      placeholder="Client full name"
                      readOnly={isView}
                    />
                    {fieldErrors.name ? <span className={styles.fieldError}>{fieldErrors.name}</span> : null}
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>WhatsApp</span>
                    <input
                      className={styles.input}
                      value={formValues.whatsapp}
                      onChange={(event) => updateField('whatsapp', event.target.value)}
                      placeholder="+856 20 ..."
                      readOnly={isView}
                    />
                    {fieldErrors.whatsapp ? <span className={styles.fieldError}>{fieldErrors.whatsapp}</span> : null}
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Email</span>
                    <input
                      className={styles.input}
                      type="email"
                      value={formValues.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      placeholder="Optional email"
                      readOnly={isView}
                    />
                  </label>

                  <div className={styles.grid}>
                    <label className={styles.field}>
                      <span className={styles.label}>Nationality</span>
                      <div className={styles.select2}>
                        <input
                          className={styles.input}
                          list="nationalities"
                          value={formValues.nationality}
                          onChange={(event) => handleNationalityChange(event.target.value)}
                          placeholder="Start typing to search"
                          readOnly={isView}
                        />
                        {!isView ? (
                          <datalist id="nationalities">
                            {nationalities.map((nation) => (
                              <option key={nation} value={nation} />
                            ))}
                          </datalist>
                        ) : null}
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Gender</span>
                      <select
                        className={styles.select}
                        value={formValues.gender}
                        onChange={(event) => updateField('gender', event.target.value)}
                        disabled={isView}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                  </div>

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxField}>
                      <input
                        type="checkbox"
                        checked={formValues.speakLaoThai}
                        onChange={(event) => updateField('speakLaoThai', event.target.checked)}
                        disabled={isView}
                      />
                      <span>Speaks Lao / Thai</span>
                    </label>
                    <label className={styles.checkboxField}>
                      <input
                        type="checkbox"
                        checked={formValues.speakEnglish}
                        onChange={(event) => updateField('speakEnglish', event.target.checked)}
                        disabled={isView}
                      />
                      <span>Speaks English</span>
                    </label>
                  </div>

                  <div className={styles.grid}>
                    <label className={styles.field}>
                      <span className={styles.label}>Status</span>
                      <select
                        className={styles.select}
                        value={formValues.status}
                        onChange={(event) => updateField('status', event.target.value)}
                        disabled={isView}
                      >
                        <option value="new">🆕 New</option>
                        <option value="active">✅ Active</option>
                        <option value="closed">🔒 Closed</option>
                        <option value="lost">❌ Lost</option>
                      </select>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Interest type</span>
                      <select
                        className={styles.select}
                        value={formValues.interestType}
                        onChange={(event) => updateField('interestType', event.target.value)}
                        disabled={isView}
                      >
                        <option value="any">Any</option>
                        <option value="house_rent">House rent</option>
                        <option value="apartment_rent">Apartment rent</option>
                        <option value="house_sale">House sale</option>
                        <option value="apartment_sale">Apartment sale</option>
                        <option value="land_sale">Land sale</option>
                      </select>
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span className={styles.label}>Source</span>
                    <select
                      className={styles.select}
                      value={formValues.source}
                      onChange={(event) => updateField('source', event.target.value)}
                      disabled={isView}
                    >
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="direct">Direct</option>
                      <option value="other">Other</option>
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Assigned to</span>
                    <div className={styles.select2}>
                      <input
                        className={styles.input}
                        list={isView ? undefined : 'user-options'}
                        value={formValues.assignedToName}
                        onChange={(event) => updateField('assignedToName', event.target.value)}
                        placeholder="Search by name"
                        readOnly={isView}
                      />
                      {!isView ? (
                        <datalist id="user-options">
                          {activeUsers.map((u) => (
                            <option key={u.id} value={u.name} />
                          ))}
                        </datalist>
                      ) : null}
                    </div>
                  </label>

                  <fieldset className={styles.fieldset}>
                    <legend className={styles.label}>Interested properties</legend>
                    {!isView ? (
                      <div className={styles.select2Property}>
                        <input
                          className={styles.input}
                          list="property-options"
                          value={propertySearch}
                          onChange={(event) => setPropertySearch(event.target.value)}
                          placeholder="Start typing property name"
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              handleAddProperty()
                            }
                          }}
                        />
                        <datalist id="property-options">
                          {listingOptions.map((listing) => (
                            <option key={listing.id} value={listing.title} />
                          ))}
                        </datalist>
                        <button type="button" className={styles.propertyAddButton} onClick={handleAddProperty}>
                          Add
                        </button>
                      </div>
                    ) : null}
                    <div className={styles.propertyChips}>
                      {formValues.interestedProperties.map((propertyId) => {
                        const listing = listingOptions.find((item) => item.id === propertyId)
                        if (!listing) return null

                        return (
                          <span key={propertyId} className={styles.propertyChip}>
                            {listing.title}
                            {!isView ? (
                              <button type="button" className={styles.propertyChipRemove} onClick={() => toggleInterestedProperty(propertyId)}>
                                ×
                              </button>
                            ) : null}
                          </span>
                        )
                      })}
                    </div>
                  </fieldset>

                  <div className={styles.grid}>
                    <label className={styles.field}>
                      <span className={styles.label}>Budget min (USD)</span>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        step="0.01"
                        value={formValues.budgetMin}
                        onChange={(event) => updateField('budgetMin', event.target.value)}
                        placeholder="Optional"
                        readOnly={isView}
                      />
                      {fieldErrors.budgetMin ? <span className={styles.fieldError}>{fieldErrors.budgetMin}</span> : null}
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Budget max (USD)</span>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        step="0.01"
                        value={formValues.budgetMax}
                        onChange={(event) => updateField('budgetMax', event.target.value)}
                        placeholder="Optional"
                        readOnly={isView}
                      />
                      {fieldErrors.budgetMax ? <span className={styles.fieldError}>{fieldErrors.budgetMax}</span> : null}
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span className={styles.label}>Notes</span>
                    <textarea
                      className={styles.textarea}
                      value={formValues.notes}
                      onChange={(event) => updateField('notes', event.target.value)}
                      rows={5}
                      placeholder="Short notes about the lead, timeline, or requirements."
                      readOnly={isView}
                    />
                  </label>

                  <div className={styles.stickyActions}>
                    {isView ? (
                      <button type="button" className={styles.primaryButton} onClick={closeForm}>
                        Close
                      </button>
                    ) : (
                      <>
                        <button type="button" className={styles.secondaryButton} onClick={closeForm}>
                          Cancel
                        </button>
                        <button type="submit" className={styles.primaryButton}>
                          {mode === 'edit' ? 'Save changes' : 'Create client'}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )
            })()}
          </form>
        </section>
      )}

      {dealClient ? (
        <CloseDealModal
          clientId={dealClient.id}
          clientName={dealClient.name}
          linkedListings={listingOptions.filter((l) =>
            dealClient.interestedPropertyIds.includes(l.id)
          )}
          allListings={listingOptions}
          onClose={() => setDealClient(null)}
          onSuccess={() => setDealClient(null)}
        />
      ) : null}

      {clientPendingDelete ? (
        <DeleteConfirmModal
          title="Delete client"
          itemName={clientPendingDelete.name}
          bodyText="This permanently deletes the client from the database. This action cannot be undone."
          confirmLabel="Delete client"
          onConfirm={() => handleDelete(clientPendingDelete)}
          onCancel={closeDeleteModal}
        />
      ) : null}
    </div>
  )
}
