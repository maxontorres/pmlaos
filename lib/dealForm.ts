export type DealMutationInput = {
  clientId: string
  listingId: string
  dealValue: number
  commission: number
  closedAt: string
  notes: string | null
}

type ValidationFailure = {
  ok: false
  error: string
  fieldErrors: Record<string, string>
}

type ValidationSuccess = {
  ok: true
  data: DealMutationInput
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

function getRequiredPositiveNumber(
  body: Record<string, unknown>,
  key: string,
  label: string,
  fieldErrors: Record<string, string>
) {
  const value = body[key]
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
  if (Number.isNaN(num) || num < 0) {
    fieldErrors[key] = `${label} must be a valid non-negative number.`
    return 0
  }
  return num
}

export function validateDealPayload(body: unknown): ValidationResult {
  if (!isRecord(body)) {
    return { ok: false, error: 'Invalid request body.', fieldErrors: {} }
  }

  const fieldErrors: Record<string, string> = {}

  const clientId = getRequiredString(body, 'clientId', 'Client', fieldErrors)
  const listingId = getRequiredString(body, 'listingId', 'Property', fieldErrors)
  const dealValue = getRequiredPositiveNumber(body, 'dealValue', 'Deal value', fieldErrors)
  const commission = getRequiredPositiveNumber(body, 'commission', 'Commission', fieldErrors)

  const closedAtRaw = body.closedAt
  let closedAt = ''
  if (typeof closedAtRaw !== 'string' || !closedAtRaw.trim()) {
    fieldErrors.closedAt = 'Closed date is required.'
  } else if (Number.isNaN(Date.parse(closedAtRaw))) {
    fieldErrors.closedAt = 'Closed date is invalid.'
  } else {
    closedAt = closedAtRaw.trim()
  }

  const notesRaw = body.notes
  const notes = typeof notesRaw === 'string' && notesRaw.trim() ? notesRaw.trim() : null

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: 'Please correct the highlighted fields.', fieldErrors }
  }

  return { ok: true, data: { clientId, listingId, dealValue, commission, closedAt, notes } }
}

export function jsonError(error: string, status: number, fieldErrors?: Record<string, string>) {
  return Response.json(
    fieldErrors ? { error, fieldErrors } : { error },
    { status }
  )
}
