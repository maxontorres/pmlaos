import { describe, it, expect, vi, afterAll } from 'vitest'
import { GET, POST } from '@/app/api/areas/route'
import { GET as GET_BY_ID, PATCH, DELETE } from '@/app/api/areas/[id]/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: '1', role: 'admin' } })),
}))

describe('Areas API Routes', () => {
  let testAreaId: string

  afterAll(async () => {
    if (testAreaId) {
      await prisma.area.delete({ where: { id: testAreaId } }).catch(() => {})
    }
  })

  describe('GET /api/areas', () => {
    it('should return all areas', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id')
        expect(data[0]).toHaveProperty('nameEn')
        expect(data[0]).toHaveProperty('nameLo')
        expect(data[0]).toHaveProperty('nameZh')
        expect(data[0]).toHaveProperty('slug')
      }
    })

    it('should return areas ordered by order field', async () => {
      const response = await GET()
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].order).toBeLessThanOrEqual(data[i + 1].order)
      }
    })
  })

  describe('POST /api/areas', () => {
    it('should create a new area', async () => {
      const payload = {
        nameEn: `API Test Area ${Date.now()}`,
        nameLo: 'ພື້ນທີ່ API',
        nameZh: 'API区',
        active: true,
        order: 100,
      }

      const request = new Request('http://localhost/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.nameEn).toBe(payload.nameEn)
      expect(data.nameLo).toBe(payload.nameLo)
      expect(data.nameZh).toBe(payload.nameZh)
      expect(data.active).toBe(true)
      expect(data.order).toBe(100)
      expect(data.slug).toBeDefined()

      testAreaId = data.id
    })

    it('should use default values for optional fields', async () => {
      const payload = {
        nameEn: `Default Area ${Date.now()}`,
        nameLo: 'ພື້ນທີ່ຄ່າເລີ່ມຕົ້ນ',
        nameZh: '默认区',
      }

      const request = new Request('http://localhost/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.active).toBe(true)
      expect(data.order).toBe(0)

      await prisma.area.delete({ where: { id: data.id } })
    })

    it('should reject missing required fields', async () => {
      const payload = {
        nameEn: 'Test Area',
      }

      const request = new Request('http://localhost/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject duplicate area name', async () => {
      const existing = await prisma.area.findFirst()
      
      if (!existing) {
        return
      }

      const payload = {
        nameEn: existing.nameEn,
        nameLo: 'Test',
        nameZh: 'Test',
      }

      const request = new Request('http://localhost/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('already exists')
    })
  })

  describe('GET /api/areas/[id]', () => {
    it('should return a specific area', async () => {
      const request = new Request(`http://localhost/api/areas/${testAreaId}`)
      const params = Promise.resolve({ id: testAreaId })

      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe(testAreaId)
      expect(data).toHaveProperty('nameEn')
    })

    it('should return 404 for non-existent area', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const request = new Request(`http://localhost/api/areas/${fakeId}`)
      const params = Promise.resolve({ id: fakeId })

      const response = await GET_BY_ID(request, { params })

      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /api/areas/[id]', () => {
    it('should update area names', async () => {
      const payload = {
        nameEn: 'Updated API Area',
        nameLo: 'ພື້ນທີ່ອັບເດດ',
        nameZh: '更新区',
      }

      const request = new Request(`http://localhost/api/areas/${testAreaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const params = Promise.resolve({ id: testAreaId })

      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.nameEn).toBe('Updated API Area')
      expect(data.nameLo).toBe('ພື້ນທີ່ອັບເດດ')
      expect(data.nameZh).toBe('更新区')
    })

    it('should update partial fields', async () => {
      const payload = {
        active: false,
        order: 50,
      }

      const request = new Request(`http://localhost/api/areas/${testAreaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const params = Promise.resolve({ id: testAreaId })

      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.active).toBe(false)
      expect(data.order).toBe(50)
    })

    it('should return 404 for non-existent area', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const payload = {
        nameEn: 'Test',
      }

      const request = new Request(`http://localhost/api/areas/${fakeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const params = Promise.resolve({ id: fakeId })

      const response = await PATCH(request, { params })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/areas/[id]', () => {
    it('should prevent deletion of area with listings', async () => {
      const area = await prisma.area.findFirst({
        include: {
          _count: { select: { listings: true } },
        },
        where: {
          listings: { some: {} },
        },
      })

      if (!area) {
        return
      }

      const request = new Request(`http://localhost/api/areas/${area.id}`, {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: area.id })

      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Cannot delete area')
    })

    it('should delete an area without listings', async () => {
      const area = await prisma.area.create({
        data: {
          nameEn: `Delete API Area ${Date.now()}`,
          nameLo: 'ລຶບພື້ນທີ່',
          nameZh: '删除区',
          slug: `delete-api-area-${Date.now()}`,
        },
      })

      const request = new Request(`http://localhost/api/areas/${area.id}`, {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: area.id })

      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      const found = await prisma.area.findUnique({ where: { id: area.id } })
      expect(found).toBeNull()
    })

    it('should return 404 for non-existent area', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const request = new Request(`http://localhost/api/areas/${fakeId}`, {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: fakeId })

      const response = await DELETE(request, { params })

      expect(response.status).toBe(404)
    })
  })
})
