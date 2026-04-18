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
    include: {
      photos: { orderBy: { order: 'asc' } },
      village: {
        select: {
          id: true,
          nameEn: true,
          slug: true,
        },
      },
    },
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

  if (data.slug) {
    const conflict = await prisma.listing.findFirst({ where: { slug: data.slug, NOT: { id } } })
    if (conflict) {
      return jsonError('Please correct the highlighted fields.', 409, { slug: 'This slug is already in use.' })
    }
  }

  try {
    const listing = await prisma.listing.update({
      where: { id },
      data: {
        ...(data.slug ? { slug: data.slug } : {}),
        category: data.category,
        transaction: data.transaction,
        status: data.status,
        featured: data.featured,
        sponsored: data.sponsored,
        sponsoredUntil: data.sponsoredUntil ? new Date(data.sponsoredUntil) : null,
        villageId: data.villageId ?? null,
        district: data.district,
        titleEn: data.titleEn,
        titleLo: data.titleEn,
        titleZh: data.titleEn,
        descriptionEn: data.descriptionEn,
        descriptionLo: data.descriptionEn,
        descriptionZh: data.descriptionEn,
        price: data.price,
        priceUnit: data.priceUnit,
        areaSqm: data.areaSqm,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        parkingAvailable: data.parkingAvailable,
        swimmingPool: data.swimmingPool,
        hasFitness: data.hasFitness,
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
  } catch (err) {
    if (err instanceof Error && err.message.includes('Record to delete does not exist')) {
      return jsonError('Listing not found.', 404)
    }
    return jsonError('Unable to delete listing.', 500)
  }
}
