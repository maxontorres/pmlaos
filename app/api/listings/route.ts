import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { jsonError, validateListingPayload } from '@/lib/listingForm'
import { prisma } from '@/lib/prisma'

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

export async function GET() {
  const session = await auth()
  if (!session) return jsonError('Unauthorized', 401)

  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      slug: true,
      titleEn: true,
      locationEn: true,
      category: true,
      transaction: true,
      status: true,
      featured: true,
      price: true,
      priceUnit: true,
      createdAt: true,
      photos: { select: { url: true, order: true }, orderBy: { order: 'asc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(listings)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return jsonError('Unauthorized', 401)

  const body = await req.json()
  const validation = validateListingPayload(body)
  if (!validation.ok) {
    return jsonError(validation.error, 400, validation.fieldErrors)
  }
  const data = validation.data

  const listing = await prisma.listing.create({
    data: {
      slug: generateSlug(data.titleEn),
      category: data.category,
      transaction: data.transaction,
      status: data.status,
      featured: data.featured,
      titleEn: data.titleEn,
      titleLo: data.titleEn,
      titleZh: data.titleEn,
      descriptionEn: data.descriptionEn,
      descriptionLo: data.descriptionEn,
      descriptionZh: data.descriptionEn,
      locationEn: data.locationEn,
      locationLo: data.locationEn,
      locationZh: data.locationEn,
      price: data.price,
      priceUnit: data.priceUnit,
      areaSqm: data.areaSqm,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      parkingSpaces: data.parkingSpaces,
      lat: data.lat,
      lng: data.lng,
      photos: data.photos.length > 0
        ? {
            create: data.photos.map((url, index) => ({
              url,
              order: index,
            })),
          }
        : undefined,
    },
  })

  return NextResponse.json(listing, { status: 201 })
}
