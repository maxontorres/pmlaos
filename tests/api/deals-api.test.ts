import { describe, it, expect, vi, afterAll } from 'vitest'
import { GET, POST } from '@/app/api/deals/route'
import { PUT, DELETE } from '@/app/api/deals/[id]/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: '1', role: 'admin' } })),
}))

describe('Deals API Routes', () => {
  let testDealId: string
  let testClient: any
  let testListing: any

  afterAll(async () => {
    if (testDealId) {
      await prisma.deal.delete({ where: { id: testDealId } }).catch(() => {})
    }
    if (testClient) {
      await prisma.client.delete({ where: { id: testClient.id } }).catch(() => {})
    }
    if (testListing) {
      await prisma.listing.delete({ where: { id: testListing.id } }).catch(() => {})
    }
  })

  describe('GET /api/deals', () => {
    it('should return all deals', async () => {
      const request = new Request('http://localhost/api/deals')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id')
        expect(data[0]).toHaveProperty('dealValue')
        expect(data[0]).toHaveProperty('commission')
        expect(data[0]).toHaveProperty('client')
        expect(data[0]).toHaveProperty('listing')
      }
    })

    it('should filter deals by clientId', async () => {
      const client = await prisma.client.findFirst()
      
      if (!client) {
        return
      }

      const request = new Request(`http://localhost/api/deals?clientId=${client.id}`)
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      data.forEach((deal: any) => {
        expect(deal.clientId).toBe(client.id)
      })
    })
  })

  describe('POST /api/deals', () => {
    it('should create a new deal with valid data', async () => {
      testClient = await prisma.client.create({
        data: {
          name: 'Deal API Client',
          whatsapp: '+8562099123456',
        },
      })

      testListing = await prisma.listing.create({
        data: {
          slug: `deal-api-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Deal API House',
          titleLo: 'Deal API House',
          titleZh: 'Deal API House',
          descriptionEn: 'Test house',
          descriptionLo: 'Test house',
          descriptionZh: 'Test house',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 180000,
        },
      })

      const payload = {
        clientId: testClient.id,
        listingId: testListing.id,
        transactionType: 'sale',
        dealValue: 180000,
        commission: 9000,
        closedAt: '2026-05-01',
        notes: 'API created deal',
      }

      const request = new Request('http://localhost/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.clientId).toBe(testClient.id)
      expect(data.listingId).toBe(testListing.id)
      expect(data.dealValue).toBe(180000)
      expect(data.commission).toBe(9000)
      expect(data.transactionType).toBe('sale')

      testDealId = data.id
    })

    it('should reject invalid deal value', async () => {
      const payload = {
        clientId: testClient.id,
        listingId: testListing.id,
        transactionType: 'sale',
        dealValue: -1000,
        commission: 500,
        closedAt: '2026-05-01',
      }

      const request = new Request('http://localhost/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject missing required fields', async () => {
      const payload = {
        transactionType: 'sale',
        dealValue: 100000,
      }

      const request = new Request('http://localhost/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('fieldErrors')
    })

    it('should reject invalid date', async () => {
      const payload = {
        clientId: testClient.id,
        listingId: testListing.id,
        transactionType: 'sale',
        dealValue: 100000,
        commission: 5000,
        closedAt: 'invalid-date',
      }

      const request = new Request('http://localhost/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('PUT /api/deals/[id]', () => {
    it('should update a deal', async () => {
      const payload = {
        clientId: testClient.id,
        listingId: testListing.id,
        transactionType: 'sale',
        dealValue: 190000,
        commission: 9500,
        closedAt: '2026-05-15',
        notes: 'Updated deal notes',
      }

      const request = new Request(`http://localhost/api/deals/${testDealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const params = Promise.resolve({ id: testDealId })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.dealValue).toBe(190000)
      expect(data.commission).toBe(9500)
      expect(data.notes).toBe('Updated deal notes')
    })

    it('should reject invalid update data', async () => {
      const payload = {
        clientId: '',
        listingId: '',
        transactionType: 'invalid',
        dealValue: 'not-a-number',
        commission: -100,
        closedAt: 'invalid',
      }

      const request = new Request(`http://localhost/api/deals/${testDealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const params = Promise.resolve({ id: testDealId })

      const response = await PUT(request, { params })

      expect(response.status).toBe(400)
    })

    it('should return 404 for non-existent deal', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const payload = {
        clientId: testClient.id,
        listingId: testListing.id,
        transactionType: 'sale',
        dealValue: 100000,
        commission: 5000,
        closedAt: '2026-05-01',
      }

      const request = new Request(`http://localhost/api/deals/${fakeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const params = Promise.resolve({ id: fakeId })

      const response = await PUT(request, { params })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/deals/[id]', () => {
    it('should delete a deal as admin', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Delete Deal Client',
          whatsapp: '+8562099654321',
        },
      })

      const listing = await prisma.listing.create({
        data: {
          slug: `delete-deal-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Delete Deal House',
          titleLo: 'Delete Deal House',
          titleZh: 'Delete Deal House',
          descriptionEn: 'Test',
          descriptionLo: 'Test',
          descriptionZh: 'Test',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 100000,
        },
      })

      const deal = await prisma.deal.create({
        data: {
          clientId: client.id,
          listingId: listing.id,
          transactionType: 'sale',
          dealValue: 100000,
          commission: 5000,
          currency: 'USD',
          commissionUsd: 5000,
          closedAt: new Date(),
        },
      })

      const request = new Request(`http://localhost/api/deals/${deal.id}`, {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: deal.id })

      const response = await DELETE(request, { params })

      expect(response.status).toBe(204)

      const found = await prisma.deal.findUnique({ where: { id: deal.id } })
      expect(found).toBeNull()

      await prisma.client.delete({ where: { id: client.id } })
      await prisma.listing.delete({ where: { id: listing.id } })
    })

    it('should return 404 for non-existent deal', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const request = new Request(`http://localhost/api/deals/${fakeId}`, {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: fakeId })

      const response = await DELETE(request, { params })

      expect(response.status).toBe(404)
    })
  })
})
