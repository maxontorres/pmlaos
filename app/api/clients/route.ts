import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      interestType: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const client = await prisma.client.create({
    data: {
      name: body.name,
      phone: body.phone,
      email: body.email ?? null,
      language: body.language ?? 'en',
      interestType: body.interestType ?? 'any',
      budgetMin: body.budgetMin ?? null,
      budgetMax: body.budgetMax ?? null,
      notes: body.notes ?? null,
      status: body.status ?? 'new',
      source: body.source ?? 'direct',
    },
  })

  return NextResponse.json(client, { status: 201 })
}
