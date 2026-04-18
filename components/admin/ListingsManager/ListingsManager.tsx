'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useCallback, useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import LocationMap from '@/components/shared/LocationMap/LocationMap'
import DeleteConfirmModal from '@/components/admin/shared/DeleteConfirmModal'
import { EyeIcon, EditIcon, TrashIcon } from '@/components/admin/shared/AdminIcons'
import styles from './ListingsManager.module.css'

// Vientiane districts for the District field
const VIENTIANE_DISTRICTS = [
  { value: 'chanthabouly', label: 'Chanthabouly' },
  { value: 'hadxayfong', label: 'Hadxayfong' },
  { value: 'naxaithong', label: 'Naxaithong' },
  { value: 'pakngum', label: 'Pakngum' },
  { value: 'sangthong', label: 'Sangthong' },
  { value: 'sikhottabong', label: 'Sikhottabong' },
  { value: 'sisattanak', label: 'Sisattanak' },
  { value: 'xaysetha', label: 'Xaysetha' },
  { value: 'xaythany', label: 'Xaythany' },
];

type ListingSummary = {
  id: string
  slug: string
  titleEn: string
  district?: string | null
  village?: {
    id: string
    nameEn: string
    slug: string
  } | null
  category: string
  transaction: string
  status: string
  featured: boolean
  sponsored: boolean
  sponsoredUntil?: string | null
  price: string | number
  priceUnit: string
  descriptionEn?: string
  areaSqm?: string | number | null
  bedrooms?: number | null
  bathrooms?: number | null
  parkingAvailable?: boolean | null
  swimmingPool?: boolean | null
  hasFitness?: boolean | null
  lat?: string | number | null
  lng?: string | number | null
  photos?: Array<{ url: string; order?: number }>
}

type ListingDetail = ListingSummary & {
  descriptionEn: string
  villageId?: string | null
  areaSqm: string | number | null
  bedrooms: number | null
  bathrooms: number | null
  parkingAvailable: boolean | null
  swimmingPool: boolean | null
  lat: string | number | null
  lng: string | number | null
  photos: Array<{ url: string; order: number }>
}

type FormValues = {
  titleEn: string
  slug: string
  descriptionEn: string
  villageId: string
  district: string
  category: string
  transaction: string
  status: string
  featured: boolean
  sponsored: boolean
  sponsoredUntil: string
  price: string
  priceUnit: string
  areaSqm: string
  bedrooms: string
  bathrooms: string
  parkingAvailable: boolean
  swimmingPool: boolean
  hasFitness: boolean
  lat: string | null
  lng: string | null
  photos: string[]
}

type ApiError = {
  error?: string
  fieldErrors?: Record<string, string>
}

const EMPTY_FORM: FormValues = {
  titleEn: '',
  slug: '',
  descriptionEn: '',
  villageId: '',
  district: '',
  category: 'house',
  transaction: 'sale',
  status: 'available',
  featured: false,
  sponsored: false,
  sponsoredUntil: '',
  price: '',
  priceUnit: 'total',
  areaSqm: '',
  bedrooms: '',
  bathrooms: '',
  parkingAvailable: false,
  swimmingPool: false,
  hasFitness: false,
  lat: null,
  lng: null,
  photos: [],
}

function toInputValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? '' : String(value)
}

function toFormValues(listing: ListingDetail): FormValues {
  return {
    titleEn: listing.titleEn ?? '',
    slug: listing.slug ?? '',
    descriptionEn: listing.descriptionEn ?? '',
    villageId: listing.village?.id ?? '',
    district: listing.district ?? '',
    category: listing.category ?? 'house',
    transaction: listing.transaction ?? 'sale',
    status: listing.status ?? 'available',
    featured: Boolean(listing.featured),
    sponsored: Boolean(listing.sponsored),
    sponsoredUntil: listing.sponsoredUntil ? listing.sponsoredUntil.split('T')[0] : '',
    price: toInputValue(listing.price),
    priceUnit: listing.priceUnit ?? 'total',
    areaSqm: toInputValue(listing.areaSqm),
    bedrooms: toInputValue(listing.bedrooms),
    bathrooms: toInputValue(listing.bathrooms),
    parkingAvailable: Boolean(listing.parkingAvailable),
    swimmingPool: Boolean(listing.swimmingPool),
    hasFitness: Boolean(listing.hasFitness),
    lat: listing.lat === null || listing.lat === undefined ? null : String(listing.lat),
    lng: listing.lng === null || listing.lng === undefined ? null : String(listing.lng),
    photos: listing.photos?.map((photo) => photo.url) ?? [],
  }
}

function formatMoney(value: string | number, priceUnit: string) {
  const amount = Number(value)
  if (Number.isNaN(amount)) return 'Price unavailable'

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)

  return priceUnit === 'per_month' ? `${formatted} / month` : formatted
}

function capitalize(value: string) {
  return value.replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase())
}

function formatArea(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return null
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(numericValue)} sqm`
}

async function parseApiError(response: Response): Promise<ApiError> {
  try {
    return (await response.json()) as ApiError
  } catch {
    return { error: 'Something went wrong.' }
  }
}

type Village = {
  id: string
  nameEn: string
  nameLo: string
  nameZh: string
  slug: string
  active: boolean
  order: number
}

type Props = {
  canDelete: boolean
  initialListings?: ListingDetail[]
  useLocalData?: boolean
}

function sortListings(items: ListingSummary[]) {
  return [...items].sort((a, b) => a.titleEn.localeCompare(b.titleEn))
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

export default function ListingsManager({ canDelete, initialListings = [], useLocalData = false }: Props) {
  const [listings, setListings] = useState<ListingSummary[]>(() => sortListings(initialListings))
  const [villages, setVillages] = useState<Village[]>([])
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'view'>('list')
  const [formValues, setFormValues] = useState<FormValues>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [listingPendingDelete, setListingPendingDelete] = useState<ListingSummary | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'house' | 'apartment' | 'land'>('all')
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'sale' | 'rent'>('all')
  const [loading, setLoading] = useState(true)
  const [loadingForm, setLoadingForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pageError, setPageError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('')
  const [manualLocationEnabled, setManualLocationEnabled] = useState(false)
  const [manualCoords, setManualCoords] = useState('')
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()

  const loadListings = useCallback(async () => {
    if (useLocalData) {
      setListings(sortListings(initialListings))
      setLoading(false)
      setPageError('')
      return
    }

    setLoading(true)
    setPageError('')

    try {
      const [listingsResponse, villagesResponse] = await Promise.all([
        fetch('/api/listings', { cache: 'no-store' }),
        fetch('/api/villages', { cache: 'no-store' }),
      ])

      if (!listingsResponse.ok) {
        const error = await parseApiError(listingsResponse)
        setPageError(error.error ?? 'Unable to load listings.')
        setListings([])
        return
      }

      if (villagesResponse.ok) {
        const villagesData = (await villagesResponse.json()) as Village[]
        setVillages(villagesData.filter((v) => v.active))
      }

      const data = (await listingsResponse.json()) as ListingSummary[]
      setListings(data)
    } catch {
      setPageError('Unable to load listings.')
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [useLocalData])

  useEffect(() => {
    void loadListings()
  }, [loadListings])

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId) openEdit(editId)
  // openEdit is defined in the same render scope; run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateField = (
    key: keyof FormValues,
    value: string | boolean | string[] | null
  ) => {
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

  const resetForm = () => {
    setFormValues(EMPTY_FORM)
    setFieldErrors({})
    setPageError('')
    setSlugManuallyEdited(false)
    setGpsStatus('')
    setManualLocationEnabled(false)
    setManualCoords('')
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setMode('create')
  }

  const openView = (id: string) => {
    if (useLocalData) {
      const localListing = initialListings.find((listing) => listing.id === id)
        ?? listings.find((listing) => listing.id === id)
      if (!localListing) {
        setPageError('Unable to load listing details.')
        return
      }

      setPageError('')
      setFieldErrors({})
      setFormValues(toFormValues({
        ...localListing,
        descriptionEn: localListing.descriptionEn ?? '',
        areaSqm: localListing.areaSqm ?? null,
        bedrooms: localListing.bedrooms ?? null,
        bathrooms: localListing.bathrooms ?? null,
        parkingAvailable: localListing.parkingAvailable ?? null,
        swimmingPool: localListing.swimmingPool ?? null,
        lat: localListing.lat ?? null,
        lng: localListing.lng ?? null,
        photos: (localListing.photos ?? []).map((photo, order) => ({
          url: photo.url,
          order: photo.order ?? order,
        })),
      }))
      setEditingId(localListing.id)
      setMode('view')
      return
    }

    setLoadingForm(true)
    setPageError('')
    setFieldErrors({})

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/listings/${id}`, { cache: 'no-store' })
          if (!response.ok) {
            const error = await parseApiError(response)
            setPageError(error.error ?? 'Unable to load listing details.')
            return
          }

          const data = (await response.json()) as ListingDetail
          setFormValues(toFormValues(data))
          setEditingId(data.id)
          setMode('view')
        } catch {
          setPageError('Unable to load listing details.')
        } finally {
          setLoadingForm(false)
        }
      })()
    })
  }

  const openEdit = (id: string) => {
    if (useLocalData) {
      const localListing = initialListings.find((listing) => listing.id === id)
        ?? listings.find((listing) => listing.id === id)
      if (!localListing) {
        setPageError('Unable to load listing details.')
        return
      }

      setPageError('')
      setFieldErrors({})
      setFormValues(toFormValues({
        ...localListing,
        descriptionEn: localListing.descriptionEn ?? '',
        areaSqm: localListing.areaSqm ?? null,
        bedrooms: localListing.bedrooms ?? null,
        bathrooms: localListing.bathrooms ?? null,
        parkingAvailable: localListing.parkingAvailable ?? null,
        swimmingPool: localListing.swimmingPool ?? null,
        lat: localListing.lat ?? null,
        lng: localListing.lng ?? null,
        photos: (localListing.photos ?? []).map((photo, order) => ({
          url: photo.url,
          order: photo.order ?? order,
        })),
      }))
      setSlugManuallyEdited(true)
      setEditingId(localListing.id)
      setMode('edit')
      return
    }

    setLoadingForm(true)
    setPageError('')
    setFieldErrors({})

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/listings/${id}`, { cache: 'no-store' })
          if (!response.ok) {
            const error = await parseApiError(response)
            setPageError(error.error ?? 'Unable to load listing details.')
            return
          }

          const data = (await response.json()) as ListingDetail
          setFormValues(toFormValues(data))
          setSlugManuallyEdited(true)
          setEditingId(data.id)
          setMode('edit')
        } catch {
          setPageError('Unable to load listing details.')
        } finally {
          setLoadingForm(false)
        }
      })()
    })
  }

  const closeForm = () => {
    resetForm()
    setMode('list')
  }

  const closeDeleteModal = () => {
    setListingPendingDelete(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPageError('')
    setFieldErrors({})

    const url = mode === 'edit' && editingId ? `/api/listings/${editingId}` : '/api/listings'
    const method = mode === 'edit' ? 'PUT' : 'POST'

    const payload = {
      ...formValues,
      slug: formValues.slug.trim() || undefined,
      titleEn: formValues.titleEn.trim(),
      descriptionEn: formValues.descriptionEn.trim(),
      villageId: formValues.villageId || null,
      district: formValues.district || null,
      price: formValues.price.trim(),
      areaSqm: formValues.areaSqm.trim(),
      bedrooms: formValues.bedrooms.trim(),
      bathrooms: formValues.bathrooms.trim(),
      parkingAvailable: formValues.parkingAvailable,
      swimmingPool: formValues.swimmingPool,
      lat: formValues.lat,
      lng: formValues.lng,
      photos: formValues.photos,
    }

    if (useLocalData) {
      const villageObj = payload.villageId
        ? villages.find((v) => v.id === payload.villageId) || null
        : null

      const nextListing: ListingDetail = {
        id: editingId ?? `seed-${crypto.randomUUID()}`,
        slug: editingId
          ? (listings.find((listing) => listing.id === editingId)?.slug ?? generateSlug(payload.titleEn))
          : generateSlug(payload.titleEn || 'listing'),
        titleEn: payload.titleEn,
        district: payload.district,
        villageId: payload.villageId,
        village: villageObj ? { id: villageObj.id, nameEn: villageObj.nameEn, slug: villageObj.slug } : null,
        category: payload.category,
        transaction: payload.transaction,
        status: payload.status,
        featured: payload.featured,
        sponsored: payload.sponsored,
        sponsoredUntil: payload.sponsoredUntil || null,
        price: payload.price,
        priceUnit: payload.priceUnit,
        descriptionEn: payload.descriptionEn,
        areaSqm: payload.areaSqm ? Number(payload.areaSqm) : null,
        bedrooms: payload.bedrooms ? Number(payload.bedrooms) : null,
        bathrooms: payload.bathrooms ? Number(payload.bathrooms) : null,
        parkingAvailable: Boolean(payload.parkingAvailable),
        swimmingPool: payload.swimmingPool ? true : null,
        lat: payload.lat ? Number(payload.lat) : null,
        lng: payload.lng ? Number(payload.lng) : null,
        photos: payload.photos.map((url, order) => ({ url, order })),
      }

      setListings((current) => {
        const exists = current.some((listing) => listing.id === nextListing.id)
        const next = exists
          ? current.map((listing) => (listing.id === nextListing.id ? nextListing : listing))
          : [...current, nextListing]
        return sortListings(next)
      })
      closeForm()
      return
    }

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            const error = await parseApiError(response)
            setPageError(error.error ?? 'Unable to save listing.')
            setFieldErrors(error.fieldErrors ?? {})
            return
          }

          await loadListings()
          closeForm()
        } catch {
          setPageError('Unable to save listing.')
        }
      })()
    })
  }

  const handleDelete = (listing: ListingSummary) => {
    if (!canDelete) return

    if (useLocalData) {
      setListings((current) => current.filter((item) => item.id !== listing.id))
      closeDeleteModal()
      return
    }

    setPageError('')
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/listings/${listing.id}`, { method: 'DELETE' })
          if (!response.ok) {
            const error = await parseApiError(response)
            setPageError(error.error ?? 'Unable to delete listing.')
            return
          }

          await loadListings()
          closeDeleteModal()
        } catch {
          setPageError('Unable to delete listing.')
        }
      })()
    })
  }

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileList = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (fileList.length === 0) {
      setFieldErrors((current) => ({ ...current, photos: 'Please choose image files.' }))
      return
    }

    setUploading(true)
    setFieldErrors((current) => {
      if (!current.photos) return current
      const next = { ...current }
      delete next.photos
      return next
    })

    try {
      const results = await Promise.all(
        fileList.map(async (file) => {
          const body = new FormData()
          body.append('file', file)
          const response = await fetch('/api/upload', { method: 'POST', body })
          if (!response.ok) {
            const json = (await response.json().catch(() => ({}))) as { error?: string }
            throw new Error(json.error ?? 'Upload failed.')
          }
          const json = (await response.json()) as { url: string }
          return json.url
        })
      )

      setFormValues((current) => ({
        ...current,
        photos: [...current.photos, ...results].slice(0, 12),
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.'
      setFieldErrors((current) => ({ ...current, photos: message }))
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (index: number) => {
    setFormValues((current) => ({
      ...current,
      photos: current.photos.filter((_, photoIndex) => photoIndex !== index),
    }))
  }

  const captureCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('GPS is not available on this device.')
      return
    }

    setGpsStatus('Getting current location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(7)
        const lng = position.coords.longitude.toFixed(7)
        setFormValues((current) => ({ ...current, lat, lng }))
        if (manualLocationEnabled) setManualCoords(`${lat}, ${lng}`)
        setGpsStatus('Current location added.')
      },
      () => {
        setGpsStatus('Unable to get current location.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const clearCurrentLocation = () => {
    setFormValues((current) => ({ ...current, lat: null, lng: null }))
    setManualCoords('')
    setGpsStatus('Location removed.')
  }

  const toggleManualLocation = () => {
    const next = !manualLocationEnabled
    setManualLocationEnabled(next)
    if (next) {
      setManualCoords(
        formValues.lat && formValues.lng ? `${formValues.lat}, ${formValues.lng}` : ''
      )
    }
  }

  const handleManualCoordsChange = (value: string) => {
    setManualCoords(value)
    const trimmed = value.trim()
    if (!trimmed) {
      updateField('lat', null)
      updateField('lng', null)
      return
    }
    const parts = trimmed.split(',')
    if (parts.length !== 2) return
    const lat = parts[0].trim()
    const lng = parts[1].trim()
    if (!lat || !lng) return
    if (!Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) {
      updateField('lat', lat)
      updateField('lng', lng)
    }
  }

  if (loading) {
    return <div className={styles.panel}>Loading listings...</div>
  }

  const isSaving = (isPending && (mode === 'create' || mode === 'edit')) || uploading
  const isEditing = mode === 'edit'
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredListings = listings.filter((listing) => {
    if (categoryFilter !== 'all' && listing.category !== categoryFilter) return false
    if (transactionFilter !== 'all' && listing.transaction !== transactionFilter) return false
    if (!normalizedSearch) return true

    return [
      listing.titleEn,
      listing.village?.nameEn ?? '',
      listing.descriptionEn ?? '',
    ].some((value) => value.toLowerCase().includes(normalizedSearch))
  })
  const hasActiveFilters = normalizedSearch.length > 0 || categoryFilter !== 'all' || transactionFilter !== 'all'

  return (
    <div className={styles.stack}>
      {pageError ? <p className={styles.errorBanner}>{pageError}</p> : null}

      {mode === 'list' ? (
        <section className={styles.stack}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarIntro}>
              <p className={styles.toolbarEyebrow}>Listings manager</p>
              <p className={styles.toolbarText}>
                {filteredListings.length === 0
                  ? 'No matching listings.'
                  : `${filteredListings.length} listing${filteredListings.length === 1 ? '' : 's'} ready to review`}
              </p>
            </div>
            <button type="button" className={styles.primaryButton} onClick={openCreate}>
              New listing
            </button>
          </div>

          <section className={styles.filtersPanel}>
            <label className={styles.searchField}>
              <span className={styles.searchLabel}>Search properties</span>
              <input
                type="search"
                className={styles.input}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title, location, or description"
              />
            </label>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Property type</span>
              <div className={styles.filterChips}>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'house', label: 'House' },
                  { value: 'apartment', label: 'Apartment' },
                  { value: 'land', label: 'Land' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.filterChip} ${categoryFilter === option.value ? styles.filterChipActive : ''}`}
                    onClick={() => setCategoryFilter(option.value as typeof categoryFilter)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Transaction</span>
              <div className={styles.filterChips}>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'sale', label: 'Buy' },
                  { value: 'rent', label: 'Rent' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.filterChip} ${transactionFilter === option.value ? styles.filterChipActive : ''}`}
                    onClick={() => setTransactionFilter(option.value as typeof transactionFilter)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                className={styles.clearFiltersButton}
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('all')
                  setTransactionFilter('all')
                }}
              >
                Clear filters
              </button>
            ) : null}
          </section>

          {listings.length === 0 ? (
            <article className={styles.emptyCard}>
              <h2 className={styles.emptyTitle}>No listings yet</h2>
              <p className={styles.emptyText}>Create the first listing to start managing the inventory.</p>
            </article>
          ) : filteredListings.length === 0 ? (
            <article className={styles.emptyCard}>
              <h2 className={styles.emptyTitle}>No matching listings</h2>
              <p className={styles.emptyText}>Try another search term or clear the active filters.</p>
            </article>
          ) : (
            <div className={styles.recordList}>
              {filteredListings.map((listing) => (
                <article key={listing.id} className={styles.recordCard}>
                  <div className={styles.recordMedia}>
                    {listing.photos?.[0]?.url ? (
                      <Image
                        src={listing.photos[0].url}
                        alt={listing.titleEn}
                        fill
                        className={styles.recordImage}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.recordImageFallback}>{capitalize(listing.category)}</div>
                    )}
                  </div>

                  <div className={styles.recordBody}>
                    <div className={styles.recordTop}>
                      <div className={styles.recordHeading}>
                        <div className={styles.recordBadgeRow}>
                          <span className={styles.categoryPill}>{capitalize(listing.category)}</span>
                          <span className={styles.transactionPill}>{capitalize(listing.transaction)}</span>
                        </div>
                        <h2 className={styles.recordTitle}>{listing.titleEn}</h2>
                        <p className={styles.recordSubtle}>{listing.village?.nameEn ?? ''}</p>
                      </div>
                      <div className={styles.statusStack}>
                        <span className={`${styles.pill} ${styles[listing.status] ?? ''}`}>{capitalize(listing.status)}</span>
                        {listing.featured ? <span className={styles.featuredPill}>Featured</span> : null}
                        {listing.sponsored ? <span className={styles.sponsoredPill}>Sponsored</span> : null}
                      </div>
                    </div>

                    <div className={styles.recordPriceRow}>
                      <p className={styles.recordValue}>{formatMoney(listing.price, listing.priceUnit)}</p>
                      {formatArea(listing.areaSqm) ? <span className={styles.recordArea}>{formatArea(listing.areaSqm)}</span> : null}
                    </div>

                    {listing.descriptionEn ? (
                      <p className={styles.recordDescription}>
                        {listing.descriptionEn.length > 120 ? `${listing.descriptionEn.slice(0, 120)}...` : listing.descriptionEn}
                      </p>
                    ) : null}

                    <div className={styles.factChips}>
                      {listing.bedrooms ? <span className={styles.factChip}>{listing.bedrooms} bed</span> : null}
                      {listing.bathrooms ? <span className={styles.factChip}>{listing.bathrooms} bath</span> : null}
                      {listing.parkingAvailable ? <span className={styles.factChip}>Parking</span> : null}
                      {listing.hasFitness ? <span className={styles.factChip}>Fitness</span> : null}
                      {listing.lat != null && listing.lng != null ? <span className={styles.factChip}>GPS saved</span> : null}
                    </div>

                    <div className={styles.actionRow}>
                      {listing.slug ? (
                        <Link
                          href={`/en/listings/${listing.slug}`}
                          className={`${styles.actionButton} ${styles.viewButton}`}
                          aria-label={`View ${listing.titleEn}`}
                        >
                          <span className={styles.actionIcon}><EyeIcon /></span>
                          <span>View</span>
                        </Link>
                      ) : (
                        <span className={`${styles.actionButton} ${styles.viewButton} ${styles.disabledButton}`} aria-label={`Cannot view ${listing.titleEn}`}>
                          <span className={styles.actionIcon}><EyeIcon /></span>
                          <span>View</span>
                        </span>
                      )}
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.secondaryButton}`}
                        onClick={() => openEdit(listing.id)}
                        disabled={loadingForm || isPending}
                        aria-label={`Edit ${listing.titleEn}`}
                      >
                        <span className={styles.actionIcon}><EditIcon /></span>
                        <span>Edit</span>
                      </button>
                      {canDelete ? (
                        <button
                          type="button"
                          className={`${styles.actionButton} ${styles.dangerButton}`}
                          onClick={() => setListingPendingDelete(listing)}
                          disabled={isPending}
                          aria-label={`Delete ${listing.titleEn}`}
                        >
                          <span className={styles.actionIcon}><TrashIcon /></span>
                          <span>Delete</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : mode === 'view' ? (
        <section className={styles.formPanel}>
          <div className={styles.formHeader}>
            <button type="button" className={styles.backButton} onClick={closeForm}>
              Back
            </button>
            <div>
              <h2 className={styles.formTitle}>{formValues.titleEn || 'View listing'}</h2>
              <p className={styles.formText}>This listing is read-only.</p>
            </div>
          </div>

          <div className={styles.form}>
            <div className={styles.field}>
              <span className={styles.label}>Title</span>
              <div className={styles.readonlyValue}>{formValues.titleEn || '—'}</div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Description</span>
              <div className={styles.readonlyValue}>{formValues.descriptionEn || '—'}</div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Village</span>
              <div className={styles.readonlyValue}>
                {villages.find((v) => v.id === formValues.villageId)?.nameEn || '—'}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>District</span>
              <div className={styles.readonlyValue}>{formValues.district ? capitalize(formValues.district) : '—'}</div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Category</span>
                <div className={styles.readonlyValue}>{formValues.category || '—'}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Transaction</span>
                <div className={styles.readonlyValue}>{formValues.transaction || '—'}</div>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Status</span>
                <div className={styles.readonlyValue}>{formValues.status || '—'}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Featured</span>
                <div className={styles.readonlyValue}>{formValues.featured ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {formValues.photos.length > 0 ? (
              <div className={styles.field}>
                <span className={styles.label}>Photos</span>
                <div className={styles.photoGrid}>
                  {formValues.photos.map((photo, index) => (
                    <div key={`${index}-${photo.slice(0, 24)}`} className={styles.photoCard}>
                      <Image src={photo} alt={`Listing photo ${index + 1}`} className={styles.photoPreview} width={320} height={320} unoptimized />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Price (USD)</span>
                <div className={styles.readonlyValue}>{formValues.price ? `${formValues.price} ${formValues.priceUnit === 'per_month' ? '/ month' : ''}` : '—'}</div>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Area (sqm)</span>
                <div className={styles.readonlyValue}>{formValues.areaSqm || '—'}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Bedrooms</span>
                <div className={styles.readonlyValue}>{formValues.bedrooms || '—'}</div>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Bathrooms</span>
                <div className={styles.readonlyValue}>{formValues.bathrooms || '—'}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Amenities</span>
                <div className={styles.readonlyValue}>
                  {[
                    formValues.parkingAvailable ? 'Parking' : null,
                    formValues.swimmingPool ? 'Swimming pool' : null,
                    formValues.hasFitness ? 'Fitness room' : null,
                  ].filter(Boolean).join(', ') || '—'}
                </div>
              </div>
            </div>

            {formValues.lat && formValues.lng ? (
              <div className={styles.field}>
                <span className={styles.label}>Map location</span>
                <span className={styles.helpText}>Saved: {formValues.lat}, {formValues.lng}</span>
                <LocationMap lat={Number(formValues.lat)} lng={Number(formValues.lng)} label={formValues.titleEn || 'Property location'} note="Saved location" height="compact" />
              </div>
            ) : null}

            <div className={styles.stickyActions}>
              <button type="button" className={styles.primaryButton} onClick={() => openEdit(editingId!)}>
                Edit this listing
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.formPanel}>
          <div className={styles.formHeader}>
            <button type="button" className={styles.backButton} onClick={closeForm} disabled={isSaving}>
              Back
            </button>
            <div>
              <h2 className={styles.formTitle}>{isEditing ? 'Edit listing' : 'New listing'}</h2>
              <p className={styles.formText}>Keep the input short and mobile-friendly.</p>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.label}>Title</span>
              <input
                className={styles.input}
                value={formValues.titleEn}
                onChange={(event) => {
                  updateField('titleEn', event.target.value)
                  if (!slugManuallyEdited) {
                    updateField('slug', generateSlug(event.target.value))
                  }
                }}
                placeholder="2-bedroom apartment in central Vientiane"
              />
              {fieldErrors.titleEn ? <span className={styles.fieldError}>{fieldErrors.titleEn}</span> : null}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Slug</span>
              <input
                className={styles.input}
                value={formValues.slug}
                onChange={(event) => {
                  setSlugManuallyEdited(true)
                  updateField('slug', event.target.value)
                }}
                placeholder="auto-generated-from-title"
              />
              {fieldErrors.slug ? <span className={styles.fieldError}>{fieldErrors.slug}</span> : null}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Description</span>
              <textarea
                className={styles.textarea}
                value={formValues.descriptionEn}
                onChange={(event) => updateField('descriptionEn', event.target.value)}
                rows={5}
                placeholder="Short summary, key features, and condition."
              />
              {fieldErrors.descriptionEn ? <span className={styles.fieldError}>{fieldErrors.descriptionEn}</span> : null}
            </label>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span className={styles.label}>Village</span>
                <select
                  className={styles.select}
                  value={formValues.villageId}
                  onChange={(event) => updateField('villageId', event.target.value)}
                >
                  <option value="">Select a village</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.nameEn}
                    </option>
                  ))}
                </select>
                {fieldErrors.villageId ? <span className={styles.fieldError}>{fieldErrors.villageId}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>District</span>
                <select
                  className={styles.select}
                  value={formValues.district}
                  onChange={(event) => updateField('district', event.target.value)}
                >
                  <option value="">— Not set —</option>
                  {VIENTIANE_DISTRICTS.map((district) => (
                    <option key={district.value} value={district.value}>
                      {district.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span className={styles.label}>Category</span>
                <select className={styles.select} value={formValues.category} onChange={(event) => updateField('category', event.target.value)}>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="land">Land</option>
                </select>
                {fieldErrors.category ? <span className={styles.fieldError}>{fieldErrors.category}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Transaction</span>
                <select className={styles.select} value={formValues.transaction} onChange={(event) => updateField('transaction', event.target.value)}>
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
                {fieldErrors.transaction ? <span className={styles.fieldError}>{fieldErrors.transaction}</span> : null}
              </label>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span className={styles.label}>Status</span>
                <select className={styles.select} value={formValues.status} onChange={(event) => updateField('status', event.target.value)}>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                  <option value="hidden">Hidden</option>
                </select>
                {fieldErrors.status ? <span className={styles.fieldError}>{fieldErrors.status}</span> : null}
              </label>

              <div className={`${styles.field} ${styles.checkboxField}`}>
                <span className={styles.label}>Featured</span>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formValues.featured}
                    onChange={(event) => updateField('featured', event.target.checked)}
                  />
                  <span>Show as featured property</span>
                </label>
              </div>

              <div className={`${styles.field} ${styles.sponsoredField}`}>
                <span className={styles.label}>🎯 Sponsored (Premium Homepage)</span>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formValues.sponsored}
                    onChange={(event) => updateField('sponsored', event.target.checked)}
                  />
                  <span>Display as sponsored banner on homepage</span>
                </label>
                {formValues.sponsored && (
                  <div className={styles.sponsoredDateRow}>
                    <label className={styles.label}>Sponsored Until (optional)</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={formValues.sponsoredUntil}
                      onChange={(event) => updateField('sponsoredUntil', event.target.value)}
                    />
                    <span className={styles.helpText}>Leave empty for unlimited. Most recent sponsored listing will be shown.</span>
                  </div>
                )}
              </div>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Property photos</span>
              <input
                className={styles.input}
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(event) => {
                  void handlePhotoUpload(event.target.files)
                  event.target.value = ''
                }}
              />
              {uploading
                ? <span className={styles.helpText}>Uploading...</span>
                : <span className={styles.helpText}>Add one or more pictures from your phone or computer.</span>
              }
              {fieldErrors.photos ? <span className={styles.fieldError}>{fieldErrors.photos}</span> : null}
              {formValues.photos.length > 0 ? (
                <div className={styles.photoGrid}>
                  {formValues.photos.map((photo, index) => (
                    <div key={`${index}-${photo.slice(0, 24)}`} className={styles.photoCard}>
                      <Image
                        src={photo}
                        alt={`Listing photo ${index + 1}`}
                        className={styles.photoPreview}
                        width={320}
                        height={320}
                        unoptimized
                      />
                      <button type="button" className={styles.photoRemove} onClick={() => removePhoto(index)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </label>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span className={styles.label}>Price (USD)</span>
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formValues.price}
                  onChange={(event) => updateField('price', event.target.value)}
                  placeholder="0"
                />
                {fieldErrors.price ? <span className={styles.fieldError}>{fieldErrors.price}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Price unit</span>
                <select className={styles.select} value={formValues.priceUnit} onChange={(event) => updateField('priceUnit', event.target.value)}>
                  <option value="total">Total</option>
                  <option value="per_month">Per month</option>
                </select>
                {fieldErrors.priceUnit ? <span className={styles.fieldError}>{fieldErrors.priceUnit}</span> : null}
              </label>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span className={styles.label}>Area (sqm)</span>
                <input className={styles.input} type="number" min="0" step="0.01" value={formValues.areaSqm} onChange={(event) => updateField('areaSqm', event.target.value)} />
                {fieldErrors.areaSqm ? <span className={styles.fieldError}>{fieldErrors.areaSqm}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Bedrooms</span>
                <input className={styles.input} type="number" min="0" step="1" value={formValues.bedrooms} onChange={(event) => updateField('bedrooms', event.target.value)} />
                {fieldErrors.bedrooms ? <span className={styles.fieldError}>{fieldErrors.bedrooms}</span> : null}
              </label>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span className={styles.label}>Bathrooms</span>
                <input className={styles.input} type="number" min="0" step="1" value={formValues.bathrooms} onChange={(event) => updateField('bathrooms', event.target.value)} />
                {fieldErrors.bathrooms ? <span className={styles.fieldError}>{fieldErrors.bathrooms}</span> : null}
              </label>

              <div className={`${styles.field} ${styles.checkboxField}`}>
                <span className={styles.label}>Amenities</span>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formValues.parkingAvailable}
                    onChange={(event) => updateField('parkingAvailable', event.target.checked)}
                  />
                  <span>Parking</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formValues.swimmingPool}
                    onChange={(event) => updateField('swimmingPool', event.target.checked)}
                  />
                  <span>Swimming pool</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formValues.hasFitness}
                    onChange={(event) => updateField('hasFitness', event.target.checked)}
                  />
                  <span>Fitness room</span>
                </label>
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Map location</span>
              <div className={styles.locationActions}>
                <button type="button" className={styles.secondaryButton} onClick={captureCurrentLocation}>
                  Use current GPS
                </button>
                <label className={styles.manualToggle}>
                  <input
                    type="checkbox"
                    checked={manualLocationEnabled}
                    onChange={toggleManualLocation}
                  />
                  <span>Set manually</span>
                </label>
                {formValues.lat && formValues.lng ? (
                  <button type="button" className={styles.backButton} onClick={clearCurrentLocation}>
                    Clear
                  </button>
                ) : null}
              </div>
              {manualLocationEnabled ? (
                <>
                  <input
                    className={styles.input}
                    value={manualCoords}
                    onChange={(event) => handleManualCoordsChange(event.target.value)}
                    placeholder="17.9757, 102.6331"
                    inputMode="decimal"
                  />
                  <span className={styles.helpText}>Latitude, longitude — e.g. 17.9757, 102.6331</span>
                </>
              ) : (
                <span className={styles.helpText}>
                  {formValues.lat && formValues.lng
                    ? `Saved: ${formValues.lat}, ${formValues.lng}`
                    : 'No location saved yet.'}
                </span>
              )}
              {gpsStatus ? <span className={styles.helpText}>{gpsStatus}</span> : null}
              {fieldErrors.lat ? <span className={styles.fieldError}>{fieldErrors.lat}</span> : null}
              {fieldErrors.lng ? <span className={styles.fieldError}>{fieldErrors.lng}</span> : null}
              {formValues.lat && formValues.lng ? (
                <LocationMap
                  lat={Number(formValues.lat)}
                  lng={Number(formValues.lng)}
                  label={formValues.titleEn || 'Property location'}
                  note="Current saved location"
                  height="compact"
                />
              ) : null}
            </div>

            <div className={styles.stickyActions}>
              <button type="button" className={styles.secondaryButton} onClick={closeForm} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Create listing'}
              </button>
            </div>
          </form>
        </section>
      )}

      {listingPendingDelete ? (
        <DeleteConfirmModal
          title="Delete listing"
          itemName={listingPendingDelete.titleEn}
          bodyText="This will permanently remove the listing. This action cannot be undone."
          confirmLabel="Delete listing"
          loading={isPending}
          onConfirm={() => handleDelete(listingPendingDelete)}
          onCancel={closeDeleteModal}
        />
      ) : null}
    </div>
  )
}
