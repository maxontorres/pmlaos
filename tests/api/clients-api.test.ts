import { describe, it, expect, vi, afterAll } from 'vitest'
import { GET, POST } from '@/app/api/clients/route'
import { PUT, DELETE } from '@/app/api/clients/[id]/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: '1', role: 'admin' } })),
}))

describe('Clients API Routes', () => {
  let testClientId: string

  afterAll(async () => {
    if (testClientId) {
      await prisma.client.delete({ where: { id: testClientId } }).catch(() => {})
    }
  })

  describe('GET /api/clients', () => {
    it('should return all clients', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id')
        expect(data[0]).toHaveProperty('name')
        expect(data[0]).toHaveProperty('whatsapp')
        expect(data[0]).toHaveProperty('status')
      }
    })
  })

  describe('POST /api/clients', () => {
    it('should create a new client with required fields', async () => {
      const payload = {
        name: 'API Test Client',
        whatsapp: '+8562099887766',
      }

      const request = new Request('http://localhost/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.name).toBe('API Test Client')
      expect(data.whatsapp).toBe('+8562099887766')
      expect(data.status).toBe('new')
      expect(data.source).toBe('direct')

      testClientId = data.id
    })

    it('should create a client with all fields', async () => {
      const payload = {
        name: 'Full Client',
        whatsapp: '+8562099887755',
        email: 'full@example.com',
        nationality: 'US',
        gender: 'male',
        speakLaoThai: true,
        speakEnglish: true,
        language: 'en',
        interestType: 'apartment_rent',
        budgetMin: 1000,
        budgetMax: 2000,
        notes: 'Looking for apartment',
        status: 'active',
        source: 'website',
      }

      const request = new Request('http://localhost/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.email).toBe('full@example.com')
      expect(data.nationality).toBe('US')
      expect(data.interestType).toBe('apartment_rent')
      expect(data.status).toBe('active')
      expect(data.source).toBe('website')

      await prisma.client.delete({ where: { id: data.id } })
    })
  })

  describe('PUT /api/clients/[id]', () => {
    it('should update a client', async () => {
      const payload = {
        name: 'Updated API Client',
        whatsapp: '+8562099887766',
        email: 'updated@example.com',
        status: 'active',
        notes: 'Updated notes',
      }

      const request = new Request(`http://localhost/api/clients/${testClientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const params = Promise.resolve({ id: testClientId })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe('Updated API Client')
      expect(data.email).toBe('updated@example.com')
      expect(data.status).toBe('active')
      expect(data.notes).toBe('Updated notes')
    })

    it('should update client budget', async () => {
      const payload = {
        name: 'API Test Client',
        whatsapp: '+8562099887766',
        budgetMin: 50000,
        budgetMax: 150000,
      }

      const request = new Request(`http://localhost/api/clients/${testClientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const params = Promise.resolve({ id: testClientId })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Number(data.budgetMin)).toBe(50000)
      expect(Number(data.budgetMax)).toBe(150000)
    })

    it('should return 404 for non-existent client', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const payload = {
        name: 'Test',
        whatsapp: '+8562011111111',
      }

      const request = new Request(`http://localhost/api/clients/${fakeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const params = Promise.resolve({ id: fakeId })

      const response = await PUT(request, { params })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/clients/[id]', () => {
    it('should delete a client as admin', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'To Delete',
          whatsapp: '+8562099998888',
        },
      })

      const request = new Request(`http://localhost/api/clients/${client.id}`, {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: client.id })

      const response = await DELETE(request, { params })

      expect(response.status).toBe(204)

      const found = await prisma.client.findUnique({ where: { id: client.id } })
      expect(found).toBeNull()
    })

    it('should return 404 for non-existent client', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const request = new Request(`http://localhost/api/clients/${fakeId}`, {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: fakeId })

      const response = await DELETE(request, { params })

      expect(response.status).toBe(404)
    })
  })
})
