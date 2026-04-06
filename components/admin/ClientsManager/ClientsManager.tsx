'use client'

import { FormEvent, useState } from 'react'
import adminListingsSeed from '@/lib/adminListingsSeed.json'
import { adminSystemUsers } from '@/lib/adminDummy'
import CloseDealModal from '@/components/admin/CloseDealModal/CloseDealModal'
import styles from './ClientsManager.module.css'

type Nationality = 'Lao' | 'Thai' | 'Vietnamese' | 'Chinese' | 'International'
type Gender = 'male' | 'female' | 'other'

type ClientRecord = {
  id: string
  name: string
  whatsapp: string
  email?: string | null
  nationality: Nationality
  gender: Gender
  interestType: 'any' | 'house_rent' | 'apartment_rent' | 'house_sale' | 'apartment_sale' | 'land_sale'
  budgetMin?: number | null
  budgetMax?: number | null
  status: 'new' | 'active' | 'closed' | 'lost'
  source: 'website' | 'referral' | 'direct' | 'other'
  notes?: string | null
  interestedPropertyIds: string[]
  assignedToId?: string | null
  speakLaoThai?: boolean
  speakEnglish?: boolean
  createdAt?: string
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

const activeUsers = adminSystemUsers.filter((u) => u.status === 'active')

const listingOptions = adminListingsSeed.map((listing) => ({
  id: listing.id,
  title: listing.titleEn,
  price: listing.price,
}))

const statusEmoji: Record<ClientRecord['status'], string> = {
  new: '🆕',
  active: '✅',
  closed: '🔒',
  lost: '❌',
}

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

function toFormValues(client: ClientRecord): FormValues {
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
    assignedToName: client.assignedToId
      ? (adminSystemUsers.find((u) => u.id === client.assignedToId)?.name ?? '')
      : '',
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

function formatGender(value: Gender) {
  const labels: Record<Gender, string> = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
  }

  return labels[value]
}

function getPropertyTitles(ids: string[]) {
  return ids
    .map((id) => listingOptions.find((listing) => listing.id === id)?.title)
    .filter(Boolean)
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

type Props = {
  initialClients?: ClientRecord[]
  userRole?: string
}

export default function ClientsManager({ initialClients = [], userRole }: Props) {
  const [clients, setClients] = useState<ClientRecord[]>(() => sortClients(initialClients))
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'view'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [propertySearch, setPropertySearch] = useState('')
  const [formValues, setFormValues] = useState<FormValues>(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [clientPendingDelete, setClientPendingDelete] = useState<ClientRecord | null>(null)
  const [dealClient, setDealClient] = useState<ClientRecord | null>(null)

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
    setFormValues(toFormValues(client))
    setMode('view')
  }

  const openEdit = (client: ClientRecord) => {
    setFieldErrors({})
    setEditingId(client.id)
    setFormValues(toFormValues(client))
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

    const nextClient: ClientRecord = {
      id: editingId ?? `client-${crypto.randomUUID()}`,
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
      interestedPropertyIds: [...formValues.interestedProperties],
      assignedToId: resolvedAssignedToId,
      speakLaoThai: formValues.speakLaoThai,
      speakEnglish: formValues.speakEnglish,
      createdAt:
        editingId
          ? clients.find((client) => client.id === editingId)?.createdAt ?? new Date().toISOString()
          : new Date().toISOString(),
    }

    setClients((current) => {
      const exists = current.some((client) => client.id === nextClient.id)
      const next = exists
        ? current.map((client) => (client.id === nextClient.id ? nextClient : client))
        : [...current, nextClient]
      return sortClients(next)
    })

    closeForm()
  }

  const handleDelete = (client: ClientRecord) => {
    setClients((current) => current.filter((item) => item.id !== client.id))
    closeDeleteModal()
  }

  return (
    <div className={styles.stack}>
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
                      <span className={`${styles.pill} ${styles[client.status]}`}>{`${statusEmoji[client.status]} ${client.status}`}</span>
                      <span className={styles.secondaryPill}>{formatInterest(client.interestType)}</span>
                      <span className={styles.nationalityPill}>{client.nationality}</span>
                    </div>
                    <h2 className={styles.recordTitle}>{client.name}</h2>
                    <p className={styles.whatsappValue}>WhatsApp: {client.whatsapp}</p>
                    {client.email ? <p className={styles.whatsappValue}>Email: {client.email}</p> : null}
                  </div>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Budget</span>
                      <p className={styles.metaValue}>{formatBudget(client)}</p>
                    </div>
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Gender</span>
                      <p className={styles.metaValue}>{formatGender(client.gender)}</p>
                    </div>
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Source</span>
                      <p className={styles.metaValue}>{client.source}</p>
                    </div>
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Assigned to</span>
                      <p className={styles.metaValue}>
                        {client.assignedToId
                          ? (activeUsers.find((u) => u.id === client.assignedToId)?.name ?? 'Unknown')
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className={styles.interestedRow}>
                    <span className={styles.metaLabel}>Interested properties</span>
                    <div className={styles.propertyChips}>
                      {getPropertyTitles(client.interestedPropertyIds).map((title) => (
                        <span key={title} className={styles.propertyChip}>{title}</span>
                      ))}
                    </div>
                  </div>

                  {client.notes ? <p className={styles.recordNotes}>{client.notes}</p> : null}

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
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="delete-client-title">
          <div className={styles.modalCard}>
            <p className={styles.modalEyebrow}>Delete client</p>
            <h2 id="delete-client-title" className={styles.modalTitle}>{clientPendingDelete.name}</h2>
            <p className={styles.modalText}>
              This removes the client from the local preview list only. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryButton} onClick={closeDeleteModal}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => handleDelete(clientPendingDelete)}
              >
                Delete client
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
