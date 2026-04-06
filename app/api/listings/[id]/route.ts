import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { jsonError, validateListingPayload } from '@/lib/listingForm'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return jsonError('Unauthorized', 401)

  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: 'asc' } } },
  })

  if (!listing) return jsonError('Not found', 404)
  return NextResponse.json(listing)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return jsonError('Unauthorized', 401)

  const { id } = await params
  const body = await req.json()
  const validation = validateListingPayload(body)
  if (!validation.ok) {
    return jsonError(validation.error, 400, validation.fieldErrors)
  }
  const data = validation.data

  try {
    const listing = await prisma.listing.update({
      where: { id },
      data: {
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
        photos: {
          deleteMany: {},
          create: data.photos.map((url, index) => ({
            url,
            order: index,
          })),
        },
      },
    })

    return NextResponse.json(listing)
  } catch {
    return jsonError('Listing not found.', 404)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return jsonError('Unauthorized', 401)
  if ((session.user as { role?: string }).role !== 'admin') {
    return jsonError('Forbidden', 403)
  }

  const { id } = await params
  try {
    await prisma.listing.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return jsonError('Listing not found.', 404)
  }
}
