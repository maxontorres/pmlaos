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

export async function GET() {
  const areas = await prisma.area.findMany({
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(areas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { nameEn, nameLo, nameZh, slug: customSlug, active, order } = body

  if (!nameEn || !nameLo || !nameZh) {
    return NextResponse.json(
      { error: 'Missing required fields: nameEn, nameLo, nameZh' },
      { status: 400 }
    )
  }

  const slug = customSlug?.trim() || generateSlug(nameEn)

  const existing = await prisma.area.findUnique({
    where: { slug },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'Area with this slug already exists' },
      { status: 400 }
    )
  }

  const area = await prisma.area.create({
    data: {
      nameEn,
      nameLo,
      nameZh,
      slug,
      active: active ?? true,
      order: order ?? 0,
    },
  })

  return NextResponse.json(area, { status: 201 })
}
