import { describe, it, expect, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Areas CRUD Operations', () => {
  let testAreaId: string

  afterAll(async () => {
    if (testAreaId) {
      await prisma.area.delete({ where: { id: testAreaId } }).catch(() => {})
    }
  })

  describe('CREATE', () => {
    it('should create an area with required fields', async () => {
      const area = await prisma.area.create({
        data: {
          nameEn: `Test Area ${Date.now()}`,
          nameLo: 'ພື້ນທີ່ທົດສອບ',
          nameZh: '测试区',
          slug: `test-area-${Date.now()}`,
        },
      })

      testAreaId = area.id
      expect(area).toBeDefined()
      expect(area.nameEn).toContain('Test Area')
      expect(area.nameLo).toBe('ພື້ນທີ່ທົດສອບ')
      expect(area.nameZh).toBe('测试区')
      expect(area.active).toBe(true)
      expect(area.order).toBe(0)
    })

    it('should create an area with custom order and active status', async () => {
      const area = await prisma.area.create({
        data: {
          nameEn: `Custom Area ${Date.now()}`,
          nameLo: 'ພື້ນທີ່ກຳນົດເອງ',
          nameZh: '自定义区',
          slug: `custom-area-${Date.now()}`,
          active: false,
          order: 10,
        },
      })

      expect(area.active).toBe(false)
      expect(area.order).toBe(10)

      await prisma.area.delete({ where: { id: area.id } })
    })
  })

  describe('READ', () => {
    it('should find an area by id', async () => {
      const area = await prisma.area.findUnique({
        where: { id: testAreaId },
      })

      expect(area).toBeDefined()
      expect(area?.id).toBe(testAreaId)
    })

    it('should find an area by slug', async () => {
      const area = await prisma.area.findUnique({
        where: { id: testAreaId },
      })

      const foundBySlug = await prisma.area.findUnique({
        where: { slug: area!.slug },
      })

      expect(foundBySlug?.id).toBe(testAreaId)
    })

    it('should find an area by nameEn', async () => {
      const area = await prisma.area.findUnique({
        where: { id: testAreaId },
      })

      const foundByName = await prisma.area.findUnique({
        where: { nameEn: area!.nameEn },
      })

      expect(foundByName?.id).toBe(testAreaId)
    })

    it('should find active areas', async () => {
      const areas = await prisma.area.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
      })

      expect(Array.isArray(areas)).toBe(true)
      areas.forEach((area) => {
        expect(area.active).toBe(true)
      })
    })

    it('should order areas by order field', async () => {
      const areas = await prisma.area.findMany({
        orderBy: { order: 'asc' },
        take: 5,
      })

      expect(Array.isArray(areas)).toBe(true)
      for (let i = 0; i < areas.length - 1; i++) {
        expect(areas[i].order).toBeLessThanOrEqual(areas[i + 1].order)
      }
    })
  })

  describe('UPDATE', () => {
    it('should update area names', async () => {
      const updated = await prisma.area.update({
        where: { id: testAreaId },
        data: {
          nameEn: 'Updated Test Area',
          nameLo: 'ພື້ນທີ່ທົດສອບອັບເດດ',
          nameZh: '更新测试区',
        },
      })

      expect(updated.nameEn).toBe('Updated Test Area')
      expect(updated.nameLo).toBe('ພື້ນທີ່ທົດສອບອັບເດດ')
      expect(updated.nameZh).toBe('更新测试区')
    })

    it('should update slug when nameEn changes', async () => {
      const originalArea = await prisma.area.findUnique({
        where: { id: testAreaId },
      })

      const updated = await prisma.area.update({
        where: { id: testAreaId },
        data: {
          nameEn: 'New Name',
          slug: 'new-name-slug',
        },
      })

      expect(updated.slug).not.toBe(originalArea!.slug)
      expect(updated.slug).toBe('new-name-slug')
    })

    it('should update active status', async () => {
      const updated = await prisma.area.update({
        where: { id: testAreaId },
        data: { active: false },
      })

      expect(updated.active).toBe(false)

      await prisma.area.update({
        where: { id: testAreaId },
        data: { active: true },
      })
    })

    it('should update order', async () => {
      const updated = await prisma.area.update({
        where: { id: testAreaId },
        data: { order: 5 },
      })

      expect(updated.order).toBe(5)
    })
  })

  describe('DELETE', () => {
    it('should delete an area without listings', async () => {
      const area = await prisma.area.create({
        data: {
          nameEn: `Delete Area ${Date.now()}`,
          nameLo: 'ລຶບພື້ນທີ່',
          nameZh: '删除区',
          slug: `delete-area-${Date.now()}`,
        },
      })

      await prisma.area.delete({ where: { id: area.id } })

      const found = await prisma.area.findUnique({
        where: { id: area.id },
      })

      expect(found).toBeNull()
    })

    it('should prevent deletion of area with listings', async () => {
      const area = await prisma.area.create({
        data: {
          nameEn: `Area With Listings ${Date.now()}`,
          nameLo: 'ພື້ນທີ່ມີລາຍການ',
          nameZh: '有列表区',
          slug: `area-listings-${Date.now()}`,
        },
      })

      const listing = await prisma.listing.create({
        data: {
          slug: `area-listing-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          areaId: area.id,
          titleEn: 'House in Area',
          titleLo: 'House in Area',
          titleZh: 'House in Area',
          descriptionEn: 'Test',
          descriptionLo: 'Test',
          descriptionZh: 'Test',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 100000,
        },
      })

      await expect(async () => {
        await prisma.area.delete({ where: { id: area.id } })
      }).rejects.toThrow()

      await prisma.listing.delete({ where: { id: listing.id } })
      await prisma.area.delete({ where: { id: area.id } })
    })
  })

  describe('RELATIONSHIPS', () => {
    it('should include listings when specified', async () => {
      const areas = await prisma.area.findMany({
        include: {
          listings: true,
        },
        take: 5,
      })

      expect(Array.isArray(areas)).toBe(true)
      areas.forEach((area) => {
        expect(Array.isArray(area.listings)).toBe(true)
      })
    })

    it('should count listings per area', async () => {
      const areas = await prisma.area.findMany({
        include: {
          _count: {
            select: { listings: true },
          },
        },
        take: 5,
      })

      expect(Array.isArray(areas)).toBe(true)
      areas.forEach((area) => {
        expect(typeof area._count.listings).toBe('number')
      })
    })
  })
})
