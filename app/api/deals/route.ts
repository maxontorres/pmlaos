import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateDealPayload, jsonError } from '@/lib/dealForm'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')

  const deals = await prisma.deal.findMany({
    where: clientId ? { clientId } : undefined,
    include: {
      client: { select: { id: true, name: true } },
      listing: { select: { id: true, titleEn: true } },
    },
    orderBy: { closedAt: 'desc' },
  })

  return NextResponse.json(deals)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const validation = validateDealPayload(body)

  if (!validation.ok) {
    return jsonError(validation.error, 400, validation.fieldErrors)
  }

  const { clientId, listingId, dealValue, commission, closedAt, notes } = validation.data

  const deal = await prisma.deal.create({
    data: {
      clientId,
      listingId,
      dealValue,
      commission,
      currency: 'USD',
      commissionUsd: commission,
      closedAt: new Date(closedAt),
      notes,
    },
  })

  return NextResponse.json(deal, { status: 201 })
}
