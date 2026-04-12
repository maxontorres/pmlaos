import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Data Validation and Constraints', () => {
  describe('Unique Constraints', () => {
    it('should enforce unique slug on listings', async () => {
      const existing = await prisma.listing.findFirst()
      if (!existing) return

      await expect(async () => {
        await prisma.listing.create({
          data: {
            slug: existing.slug,
            category: 'house',
            transaction: 'sale',
            titleEn: 'Duplicate Slug',
            titleLo: 'Duplicate Slug',
            titleZh: 'Duplicate Slug',
            descriptionEn: 'Test',
            descriptionLo: 'Test',
            descriptionZh: 'Test',
            locationEn: 'Test',
            locationLo: 'Test',
            locationZh: 'Test',
            price: 100000,
          },
        })
      }).rejects.toThrow()
    })

    it('should enforce unique area nameEn', async () => {
      const existing = await prisma.area.findFirst()
      if (!existing) return

      await expect(async () => {
        await prisma.area.create({
          data: {
            nameEn: existing.nameEn,
            nameLo: 'Test',
            nameZh: 'Test',
            slug: `test-${Date.now()}`,
          },
        })
      }).rejects.toThrow()
    })

    it('should enforce unique area slug', async () => {
      const existing = await prisma.area.findFirst()
      if (!existing) return

      await expect(async () => {
        await prisma.area.create({
          data: {
            nameEn: `Unique Name ${Date.now()}`,
            nameLo: 'Test',
            nameZh: 'Test',
            slug: existing.slug,
          },
        })
      }).rejects.toThrow()
    })

    it('should enforce unique user email', async () => {
      const existing = await prisma.user.findFirst()
      if (!existing) return

      await expect(async () => {
        await prisma.user.create({
          data: {
            name: 'Duplicate Email',
            email: existing.email,
            password: 'password123',
          },
        })
      }).rejects.toThrow()
    })
  })

  describe('Enum Validations', () => {
    it('should reject invalid listing category', async () => {
      await expect(async () => {
        await prisma.listing.create({
          data: {
            slug: `invalid-${Date.now()}`,
            category: 'invalid' as any,
            transaction: 'sale',
            titleEn: 'Test',
            titleLo: 'Test',
            titleZh: 'Test',
            descriptionEn: 'Test',
            descriptionLo: 'Test',
            descriptionZh: 'Test',
            locationEn: 'Test',
            locationLo: 'Test',
            locationZh: 'Test',
            price: 100000,
          },
        })
      }).rejects.toThrow()
    })

    it('should reject invalid listing status', async () => {
      await expect(async () => {
        await prisma.listing.create({
          data: {
            slug: `invalid-status-${Date.now()}`,
            category: 'house',
            transaction: 'sale',
            status: 'invalid' as any,
            titleEn: 'Test',
            titleLo: 'Test',
            titleZh: 'Test',
            descriptionEn: 'Test',
            descriptionLo: 'Test',
            descriptionZh: 'Test',
            locationEn: 'Test',
            locationLo: 'Test',
            locationZh: 'Test',
            price: 100000,
          },
        })
      }).rejects.toThrow()
    })

    it('should reject invalid client status', async () => {
      await expect(async () => {
        await prisma.client.create({
          data: {
            name: 'Test',
            whatsapp: '+8562099000009',
            status: 'invalid' as any,
          },
        })
      }).rejects.toThrow()
    })

    it('should reject invalid deal transaction type', async () => {
      const client = await prisma.client.findFirst()
      const listing = await prisma.listing.findFirst()
      if (!client || !listing) return

      await expect(async () => {
        await prisma.deal.create({
          data: {
            clientId: client.id,
            listingId: listing.id,
            transactionType: 'invalid' as any,
            dealValue: 100000,
            commission: 5000,
            currency: 'USD',
            commissionUsd: 5000,
            closedAt: new Date(),
          },
        })
      }).rejects.toThrow()
    })
  })

  describe('Decimal Precision', () => {
    it('should store listing price with correct precision', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `decimal-test-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Decimal Test',
          titleLo: 'Decimal Test',
          titleZh: 'Decimal Test',
          descriptionEn: 'Test',
          descriptionLo: 'Test',
          descriptionZh: 'Test',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 123456.78,
        },
      })

      expect(listing.price.toString()).toBe('123456.78')

      await prisma.listing.delete({ where: { id: listing.id } })
    })

    it('should store area sqm with correct precision', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `area-decimal-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Area Decimal Test',
          titleLo: 'Area Decimal Test',
          titleZh: 'Area Decimal Test',
          descriptionEn: 'Test',
          descriptionLo: 'Test',
          descriptionZh: 'Test',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 100000,
          areaSqm: 123.45,
        },
      })

      expect(listing.areaSqm?.toString()).toBe('123.45')

      await prisma.listing.delete({ where: { id: listing.id } })
    })

    it('should store coordinates with correct precision', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `coords-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Coords Test',
          titleLo: 'Coords Test',
          titleZh: 'Coords Test',
          descriptionEn: 'Test',
          descriptionLo: 'Test',
          descriptionZh: 'Test',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 100000,
          lat: 17.9757123,
          lng: 102.6331456,
        },
      })

      expect(listing.lat?.toString()).toBe('17.9757123')
      expect(listing.lng?.toString()).toBe('102.6331456')

      await prisma.listing.delete({ where: { id: listing.id } })
    })

    it('should store client budget with correct precision', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Budget Test',
          whatsapp: '+8562099000010',
          budgetMin: 50000.5,
          budgetMax: 200000.75,
        },
      })

      expect(client.budgetMin?.toString()).toBe('50000.5')
      expect(client.budgetMax?.toString()).toBe('200000.75')

      await prisma.client.delete({ where: { id: client.id } })
    })
  })

  describe('Default Values', () => {
    it('should apply default values to listing', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `defaults-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Defaults Test',
          titleLo: 'Defaults Test',
          titleZh: 'Defaults Test',
          descriptionEn: 'Test',
          descriptionLo: 'Test',
          descriptionZh: 'Test',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 100000,
        },
      })

      expect(listing.status).toBe('available')
      expect(listing.featured).toBe(false)
      expect(listing.sponsored).toBe(false)
      expect(listing.parkingAvailable).toBe(false)
      expect(listing.swimmingPool).toBe(false)
      expect(listing.priceUnit).toBe('total')

      await prisma.listing.delete({ where: { id: listing.id } })
    })

    it('should apply default values to client', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Client Defaults',
          whatsapp: '+8562099000011',
        },
      })

      expect(client.status).toBe('new')
      expect(client.source).toBe('direct')
      expect(client.language).toBe('en')
      expect(client.interestType).toBe('any')
      expect(client.speakLaoThai).toBe(false)
      expect(client.speakEnglish).toBe(false)

      await prisma.client.delete({ where: { id: client.id } })
    })

    it('should apply default values to area', async () => {
      const area = await prisma.area.create({
        data: {
          nameEn: `Area Defaults ${Date.now()}`,
          nameLo: 'Test',
          nameZh: 'Test',
          slug: `area-defaults-${Date.now()}`,
        },
      })

      expect(area.active).toBe(true)
      expect(area.order).toBe(0)

      await prisma.area.delete({ where: { id: area.id } })
    })

    it('should apply default values to user', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'User Defaults',
          email: `defaults-${Date.now()}@example.com`,
          password: 'password123',
        },
      })

      expect(user.role).toBe('agent')
      expect(user.active).toBe(true)

      await prisma.user.delete({ where: { id: user.id } })
    })
  })

  describe('Required Fields', () => {
    it('should reject listing without required fields', async () => {
      await expect(async () => {
        await prisma.listing.create({
          data: {
            slug: `required-${Date.now()}`,
            category: 'house',
            transaction: 'sale',
          } as any,
        })
      }).rejects.toThrow()
    })

    it('should reject client without required fields', async () => {
      await expect(async () => {
        await prisma.client.create({
          data: {
            name: 'Missing WhatsApp',
          } as any,
        })
      }).rejects.toThrow()
    })

    it('should reject area without required fields', async () => {
      await expect(async () => {
        await prisma.area.create({
          data: {
            nameEn: 'Missing Fields',
          } as any,
        })
      }).rejects.toThrow()
    })
  })

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `timestamps-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Timestamps Test',
          titleLo: 'Timestamps Test',
          titleZh: 'Timestamps Test',
          descriptionEn: 'Test',
          descriptionLo: 'Test',
          descriptionZh: 'Test',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 100000,
        },
      })

      expect(listing.createdAt).toBeDefined()
      expect(listing.updatedAt).toBeDefined()
      expect(listing.createdAt).toBeInstanceOf(Date)
      expect(listing.updatedAt).toBeInstanceOf(Date)

      await prisma.listing.delete({ where: { id: listing.id } })
    })

    it('should update updatedAt on modification', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `update-time-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Update Time Test',
          titleLo: 'Update Time Test',
          titleZh: 'Update Time Test',
          descriptionEn: 'Test',
          descriptionLo: 'Test',
          descriptionZh: 'Test',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 100000,
        },
      })

      const originalUpdatedAt = listing.updatedAt

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updated = await prisma.listing.update({
        where: { id: listing.id },
        data: { price: 150000 },
      })

      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())

      await prisma.listing.delete({ where: { id: listing.id } })
    })
  })
})
