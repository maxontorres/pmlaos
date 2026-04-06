const CATEGORY_VALUES = ['house', 'apartment', 'land'] as const
const TRANSACTION_VALUES = ['sale', 'rent'] as const
const STATUS_VALUES = ['available', 'sold', 'rented', 'hidden'] as const
const PRICE_UNIT_VALUES = ['total', 'per_month'] as const

export type ListingMutationInput = {
  category: (typeof CATEGORY_VALUES)[number]
  transaction: (typeof TRANSACTION_VALUES)[number]
  status: (typeof STATUS_VALUES)[number]
  featured: boolean
  titleEn: string
  descriptionEn: string
  locationEn: string
  price: string
  priceUnit: (typeof PRICE_UNIT_VALUES)[number]
  areaSqm: string | null
  bedrooms: number | null
  bathrooms: number | null
  parkingSpaces: number | null
  lat: string | null
  lng: string | null
  photos: string[]
}

type ValidationFailure = {
  ok: false
  error: string
  fieldErrors: Record<string, string>
}

type ValidationSuccess = {
  ok: true
  data: ListingMutationInput
}

type ValidationResult = ValidationFailure | ValidationSuccess

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getRequiredString(
  body: Record<string, unknown>,
  key: string,
  label: string,
  fieldErrors: Record<string, string>
) {
  const value = body[key]
  if (typeof value !== 'string' || !value.trim()) {
    fieldErrors[key] = `${label} is required.`
    return ''
  }

  return value.trim()
}

function getEnumValue<T extends readonly string[]>(
  body: Record<string, unknown>,
  key: string,
  values: T,
  label: string,
  fieldErrors: Record<string, string>
): T[number] {
  const value = body[key]
  if (typeof value !== 'string' || !values.includes(value)) {
    fieldErrors[key] = `${label} is invalid.`
    return values[0]
  }

  return value as T[number]
}

function getBooleanValue(body: Record<string, unknown>, key: string) {
  return body[key] === true
}

function getRequiredDecimal(
  body: Record<string, unknown>,
  key: string,
  label: string,
  fieldErrors: Record<string, string>
) {
  const value = body[key]
  if (value === undefined || value === null || value === '') {
    fieldErrors[key] = `${label} is required.`
    return '0'
  }

  const normalized = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : ''
  if (!normalized || Number.isNaN(Number(normalized))) {
    fieldErrors[key] = `${label} must be a valid number.`
    return '0'
  }

  return normalized
}

function getOptionalDecimal(
  body: Record<string, unknown>,
  key: string,
  label: string,
  fieldErrors: Record<string, string>
) {
  const value = body[key]
  if (value === undefined || value === null || value === '') return null

  const normalized = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : ''
  if (!normalized || Number.isNaN(Number(normalized))) {
    fieldErrors[key] = `${label} must be a valid number.`
    return null
  }

  return normalized
}

function getOptionalInteger(
  body: Record<string, unknown>,
  key: string,
  label: string,
  fieldErrors: Record<string, string>
) {
  const value = body[key]
  if (value === undefined || value === null || value === '') return null

  const normalized = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.trim()) : Number.NaN
  if (!Number.isInteger(normalized)) {
    fieldErrors[key] = `${label} must be a whole number.`
    return null
  }

  return normalized
}

function getPhotos(
  body: Record<string, unknown>,
  fieldErrors: Record<string, string>
) {
  const value = body.photos
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) {
    fieldErrors.photos = 'Photos are invalid.'
    return []
  }

  const photos = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)

  if (photos.length !== value.length) {
    fieldErrors.photos = 'Photos are invalid.'
  }

  return photos
}

export function validateListingPayload(body: unknown): ValidationResult {
  if (!isRecord(body)) {
    return {
      ok: false,
      error: 'Invalid request body.',
      fieldErrors: {},
    }
  }

  const fieldErrors: Record<string, string> = {}
  const data: ListingMutationInput = {
    category: getEnumValue(body, 'category', CATEGORY_VALUES, 'Category', fieldErrors),
    transaction: getEnumValue(body, 'transaction', TRANSACTION_VALUES, 'Transaction', fieldErrors),
    status: getEnumValue(body, 'status', STATUS_VALUES, 'Status', fieldErrors),
    featured: getBooleanValue(body, 'featured'),
    titleEn: getRequiredString(body, 'titleEn', 'Title', fieldErrors),
    descriptionEn: getRequiredString(body, 'descriptionEn', 'Description', fieldErrors),
    locationEn: getRequiredString(body, 'locationEn', 'Location', fieldErrors),
    price: getRequiredDecimal(body, 'price', 'Price', fieldErrors),
    priceUnit: getEnumValue(body, 'priceUnit', PRICE_UNIT_VALUES, 'Price unit', fieldErrors),
    areaSqm: getOptionalDecimal(body, 'areaSqm', 'Area', fieldErrors),
    bedrooms: getOptionalInteger(body, 'bedrooms', 'Bedrooms', fieldErrors),
    bathrooms: getOptionalInteger(body, 'bathrooms', 'Bathrooms', fieldErrors),
    parkingSpaces: getOptionalInteger(body, 'parkingSpaces', 'Parking spaces', fieldErrors),
    lat: getOptionalDecimal(body, 'lat', 'Latitude', fieldErrors),
    lng: getOptionalDecimal(body, 'lng', 'Longitude', fieldErrors),
    photos: getPhotos(body, fieldErrors),
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: 'Please correct the highlighted fields.',
      fieldErrors,
    }
  }

  return { ok: true, data }
}

export function jsonError(
  error: string,
  status: number,
  fieldErrors?: Record<string, string>
) {
  return Response.json(
    fieldErrors ? { error, fieldErrors } : { error },
    { status }
  )
}
