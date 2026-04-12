import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { GET, POST } from '@/app/api/listings/route'
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/listings/[id]/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: '1', role: 'admin' } })),
}))

describe('Listings API Routes', () => {
  let testListingId: string

  afterAll(async () => {
    if (testListingId) {
      await prisma.listing.delete({ where: { id: testListingId } }).catch(() => {})
    }
  })

  describe('GET /api/listings', () => {
    it('should return all listings', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id')
        expect(data[0]).toHaveProperty('titleEn')
        expect(data[0]).toHaveProperty('category')
        expect(data[0]).toHaveProperty('price')
      }
    })

    it('should include photos in listings', async () => {
      const response = await GET()
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)
      data.forEach((listing: any) => {
        expect(Array.isArray(listing.photos)).toBe(true)
      })
    })
  })

  describe('POST /api/listings', () => {
    it('should create a new listing with valid data', async () => {
      const payload = {
        category: 'house',
        transaction: 'sale',
        status: 'available',
        featured: false,
        sponsored: false,
        sponsoredUntil: null,
        areaId: null,
        titleEn: 'API Test House',
        descriptionEn: 'A house created via API',
        locationEn: 'Test Location',
        price: '150000',
        priceUnit: 'total',
        areaSqm: '200',
        bedrooms: 3,
        bathrooms: 2,
        parkingAvailable: true,
        swimmingPool: false,
        lat: null,
        lng: null,
        photos: ['https://example.com/photo1.jpg'],
      }

      const request = new Request('http://localhost/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.titleEn).toBe('API Test House')
      expect(data.category).toBe('house')

      testListingId = data.id
    })

    it('should reject invalid category', async () => {
      const payload = {
        category: 'invalid',
        transaction: 'sale',
        titleEn: 'Test',
        descriptionEn: 'Test',
        locationEn: 'Test',
        price: '100000',
        priceUnit: 'total',
        photos: [],
      }

      const request = new Request('http://localhost/api/listings', {
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
        category: 'house',
        transaction: 'sale',
      }

      const request = new Request('http://localhost/api/listings', {
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
  })

  describe('GET /api/listings/[id]', () => {
    it('should return a specific listing', async () => {
      const request = new Request(`http://localhost/api/listings/${testListingId}`)
      const params = Promise.resolve({ id: testListingId })

      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe(testListingId)
      expect(data).toHaveProperty('titleEn')
      expect(data).toHaveProperty('photos')
    })

    it('should return 404 for non-existent listing', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const request = new Request(`http://localhost/api/listings/${fakeId}`)
      const params = Promise.resolve({ id: fakeId })

      const response = await GET_BY_ID(request, { params })

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/listings/[id]', () => {
    it('should update a listing', async () => {
      const payload = {
        category: 'house',
        transaction: 'sale',
        status: 'sold',
        featured: true,
        sponsored: false,
        sponsoredUntil: null,
        areaId: null,
        titleEn: 'Updated API Test House',
        descriptionEn: 'Updated description',
        locationEn: 'Updated Location',
        price: '175000',
        priceUnit: 'total',
        areaSqm: '220',
        bedrooms: 4,
        bathrooms: 3,
        parkingAvailable: true,
        swimmingPool: true,
        lat: null,
        lng: null,
        photos: ['https://example.com/new-photo.jpg'],
      }

      const request = new Request(`http://localhost/api/listings/${testListingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const params = Promise.resolve({ id: testListingId })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.titleEn).toBe('Updated API Test House')
      expect(data.status).toBe('sold')
      expect(data.featured).toBe(true)
      expect(data.bedrooms).toBe(4)
    })

    it('should reject invalid data on update', async () => {
      const payload = {
        category: 'invalid',
        transaction: 'sale',
        titleEn: '',
        descriptionEn: 'Test',
        locationEn: 'Test',
        price: 'invalid',
        priceUnit: 'total',
        photos: [],
      }

      const request = new Request(`http://localhost/api/listings/${testListingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const params = Promise.resolve({ id: testListingId })

      const response = await PUT(request, { params })

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/listings/[id]', () => {
    it('should delete a listing as admin', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `delete-api-test-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'To Delete',
          titleLo: 'To Delete',
          titleZh: 'To Delete',
          descriptionEn: 'Will be deleted',
          descriptionLo: 'Will be deleted',
          descriptionZh: 'Will be deleted',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 100000,
        },
      })

      const request = new Request(`http://localhost/api/listings/${listing.id}`, {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: listing.id })

      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)

      const found = await prisma.listing.findUnique({ where: { id: listing.id } })
      expect(found).toBeNull()
    })

    it('should return 404 for non-existent listing', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const request = new Request(`http://localhost/api/listings/${fakeId}`, {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: fakeId })

      const response = await DELETE(request, { params })

      expect(response.status).toBe(404)
    })
  })
})
