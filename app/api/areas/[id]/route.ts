import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const area = await prisma.area.findUnique({
    where: { id },
  })

  if (!area) {
    return NextResponse.json({ error: 'Area not found' }, { status: 404 })
  }

  return NextResponse.json(area)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { nameEn, nameLo, nameZh, slug: customSlug, active, order } = body

  const { id } = await params
  const existing = await prisma.area.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Area not found' }, { status: 404 })
  }

  const updateData: any = {}
  
  if (nameEn !== undefined) {
    updateData.nameEn = nameEn
  }
  if (customSlug !== undefined) {
    const newSlug = customSlug?.trim() || (nameEn ? generateSlug(nameEn) : existing.slug)
    if (newSlug !== existing.slug) {
      const slugExists = await prisma.area.findFirst({
        where: { slug: newSlug, id: { not: id } },
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Area with this slug already exists' },
          { status: 400 }
        )
      }
      updateData.slug = newSlug
    }
  }
  if (nameLo !== undefined) updateData.nameLo = nameLo
  if (nameZh !== undefined) updateData.nameZh = nameZh
  if (active !== undefined) updateData.active = active
  if (order !== undefined) updateData.order = order

  const area = await prisma.area.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(area)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.area.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Area not found' }, { status: 404 })
  }

  const listingsCount = await prisma.listing.count({
    where: { areaId: id },
  })

  if (listingsCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete area. ${listingsCount} listings are using this area.` },
      { status: 400 }
    )
  }

  await prisma.area.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
