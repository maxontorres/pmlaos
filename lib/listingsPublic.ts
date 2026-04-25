import { prisma } from '@/lib/prisma'

export type PublicListing = {
  id: string
  slug: string
  areaSlug: string | null
  category: 'house' | 'apartment' | 'land' | 'hotel'
  transaction: 'sale' | 'rent'
  status: 'available' | 'sold' | 'rented' | 'hidden'
  featured: boolean
  titleEn: string
  villageName: string | null
  district: string | null
  descriptionEn: string
  price: number
  priceUnit: 'total' | 'per_day' | 'per_week' | 'per_month' | 'per_three_months' | 'per_six_months' | 'per_year'
  areaSqm: number | null
  bedrooms: number | null
  bathrooms: number | null
  parkingAvailable: boolean
  swimmingPool: boolean
  hasFitness: boolean
  amenities: string[]
  lat: number | null
  lng: number | null
  photos: string[]
}

export type PropertyCategory = 'house' | 'apartment' | 'land' | 'hotel'
export type TransactionType = 'sale' | 'rent'

export type PublicFilters = {
  category?: PropertyCategory
  transaction?: TransactionType
  areaSlug?: string
  query?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  minBedrooms?: number
  amenities?: string[]
  take?: number
  skip?: number
}

function mapListing(raw: {
  id: string
  slug: string
  village: { slug: string; nameEn: string } | null
  district: string | null
  category: string
  transaction: string
  status: string
  featured: boolean
  titleEn: string
  descriptionEn: string
  price: { toNumber(): number } | number
  priceUnit: string
  areaSqm: { toNumber(): number } | number | null
  bedrooms: number | null
  bathrooms: number | null
  parkingAvailable: boolean
  swimmingPool: boolean
  hasFitness: boolean
  amenities: string[]
  lat: { toNumber(): number } | number | null
  lng: { toNumber(): number } | number | null
  photos: { url: string }[]
}): PublicListing {
  return {
    id: raw.id,
    slug: raw.slug,
    areaSlug: raw.village?.slug ?? null,
    category: raw.category as PublicListing['category'],
    transaction: raw.transaction as PublicListing['transaction'],
    status: raw.status as PublicListing['status'],
    featured: raw.featured,
    titleEn: raw.titleEn,
    villageName: raw.village?.nameEn ?? null,
    district: raw.district,
    descriptionEn: raw.descriptionEn,
    price: typeof raw.price === 'number' ? raw.price : raw.price.toNumber(),
    priceUnit: raw.priceUnit as PublicListing['priceUnit'],
    areaSqm: raw.areaSqm == null ? null : typeof raw.areaSqm === 'number' ? raw.areaSqm : raw.areaSqm.toNumber(),
    bedrooms: raw.bedrooms,
    bathrooms: raw.bathrooms,
    parkingAvailable: raw.parkingAvailable,
    swimmingPool: raw.swimmingPool,
    hasFitness: raw.hasFitness,
    amenities: raw.amenities,
    lat: raw.lat == null ? null : typeof raw.lat === 'number' ? raw.lat : raw.lat.toNumber(),
    lng: raw.lng == null ? null : typeof raw.lng === 'number' ? raw.lng : raw.lng.toNumber(),
    photos: raw.photos.map((p) => p.url),
  }
}

const LISTING_SELECT = {
  id: true,
  slug: true,
  village: { select: { slug: true, nameEn: true } },
  district: true,
  category: true,
  transaction: true,
  status: true,
  featured: true,
  titleEn: true,
  descriptionEn: true,
  price: true,
  priceUnit: true,
  areaSqm: true,
  bedrooms: true,
  bathrooms: true,
  parkingAvailable: true,
  swimmingPool: true,
  hasFitness: true,
  amenities: true,
  lat: true,
  lng: true,
  photos: { select: { url: true }, orderBy: { order: 'asc' as const } },
} as const

function buildWhere(filters: Omit<PublicFilters, 'take' | 'skip'>) {
  const { category, transaction, areaSlug, query, minPrice, maxPrice, minArea, maxArea, minBedrooms, amenities } = filters
  return {
    status: 'available' as const,
    ...(category ? { category } : {}),
    ...(transaction ? { transaction } : {}),
    ...(areaSlug ? { village: { slug: areaSlug } } : {}),
    ...(query
      ? {
          OR: [
            { titleEn: { contains: query, mode: 'insensitive' as const } },
            { village: { nameEn: { contains: query, mode: 'insensitive' as const } } },
            { descriptionEn: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(minPrice != null || maxPrice != null
      ? {
          price: {
            ...(minPrice != null ? { gte: minPrice } : {}),
            ...(maxPrice != null ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(minArea != null || maxArea != null
      ? {
          areaSqm: {
            ...(minArea != null ? { gte: minArea } : {}),
            ...(maxArea != null ? { lte: maxArea } : {}),
          },
        }
      : {}),
    ...(minBedrooms != null ? { bedrooms: { gte: minBedrooms } } : {}),
    ...(amenities && amenities.length > 0
      ? {
          OR: [
            ...(amenities.includes('gym') ? [{ hasFitness: true }] : []),
            ...(amenities.includes('pool') ? [{ swimmingPool: true }] : []),
            ...(amenities.includes('parking') ? [{ parkingAvailable: true }] : []),
          ],
        }
      : {}),
  }
}

export async function getPublicListings(filters: PublicFilters = {}): Promise<PublicListing[]> {
  const { take, skip } = filters
  const rows = await prisma.listing.findMany({
    where: buildWhere(filters),
    select: LISTING_SELECT,
    orderBy: { createdAt: 'desc' },
    ...(take != null ? { take } : {}),
    ...(skip != null ? { skip } : {}),
  })
  return rows.map(mapListing)
}

export async function getListingsCount(filters: Omit<PublicFilters, 'take' | 'skip'> = {}): Promise<number> {
  return prisma.listing.count({ where: buildWhere(filters) })
}

export async function getFeaturedListings(): Promise<PublicListing[]> {
  const rows = await prisma.listing.findMany({
    where: { featured: true, status: 'available' },
    select: LISTING_SELECT,
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
  return rows.map(mapListing)
}

export async function getSponsoredListing(): Promise<PublicListing | null> {
  const now = new Date()
  const row = await prisma.listing.findFirst({
    where: {
      sponsored: true,
      status: 'available',
      OR: [
        { sponsoredUntil: null },
        { sponsoredUntil: { gte: now } }
      ]
    },
    select: LISTING_SELECT,
    orderBy: { createdAt: 'desc' },
  })
  return row ? mapListing(row) : null
}

export async function getListingBySlug(slug: string): Promise<PublicListing | null> {
  const row = await prisma.listing.findUnique({
    where: { slug },
    select: LISTING_SELECT,
  })
  return row ? mapListing(row) : null
}

export async function getAllPublicSlugs(): Promise<string[]> {
  const rows = await prisma.listing.findMany({
    where: { status: { not: 'hidden' } },
    select: { slug: true },
  })
  return rows.map((r) => r.slug)
}

export function formatPrice(price: number, priceUnit: 'total' | 'per_day' | 'per_week' | 'per_month' | 'per_three_months' | 'per_six_months' | 'per_year'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)

  if (priceUnit === 'per_day') return `${formatted}/day`
  if (priceUnit === 'per_week') return `${formatted}/wk`
  if (priceUnit === 'per_month') return `${formatted}/mo`
  if (priceUnit === 'per_three_months') return `${formatted}/3mo`
  if (priceUnit === 'per_six_months') return `${formatted}/6mo`
  if (priceUnit === 'per_year') return `${formatted}/yr`
  return formatted
}
