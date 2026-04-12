import { describe, it, expect, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Deals CRUD Operations', () => {
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

  describe('CREATE', () => {
    it('should create a deal with required fields', async () => {
      testClient = await prisma.client.create({
        data: {
          name: 'Deal Test Client',
          whatsapp: '+8562088888888',
        },
      })

      testListing = await prisma.listing.create({
        data: {
          slug: `deal-test-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Deal Test House',
          titleLo: 'Deal Test House',
          titleZh: 'Deal Test House',
          descriptionEn: 'Test house for deal',
          descriptionLo: 'Test house for deal',
          descriptionZh: 'Test house for deal',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 200000,
        },
      })

      const deal = await prisma.deal.create({
        data: {
          clientId: testClient.id,
          listingId: testListing.id,
          transactionType: 'sale',
          dealValue: 200000,
          commission: 10000,
          currency: 'USD',
          commissionUsd: 10000,
          closedAt: new Date('2026-03-15'),
        },
      })

      testDealId = deal.id
      expect(deal).toBeDefined()
      expect(deal.clientId).toBe(testClient.id)
      expect(deal.listingId).toBe(testListing.id)
      expect(deal.transactionType).toBe('sale')
      expect(deal.dealValue).toBe(200000)
      expect(deal.commission).toBe(10000)
      expect(deal.currency).toBe('USD')
    })

    it('should create a rental deal', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Rental Client',
          whatsapp: '+8562077777777',
        },
      })

      const listing = await prisma.listing.create({
        data: {
          slug: `rental-deal-${Date.now()}`,
          category: 'apartment',
          transaction: 'rent',
          titleEn: 'Rental Apartment',
          titleLo: 'Rental Apartment',
          titleZh: 'Rental Apartment',
          descriptionEn: 'For rent',
          descriptionLo: 'For rent',
          descriptionZh: 'For rent',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 1500,
          priceUnit: 'per_month',
        },
      })

      const deal = await prisma.deal.create({
        data: {
          clientId: client.id,
          listingId: listing.id,
          transactionType: 'rent',
          dealValue: 18000,
          commission: 1500,
          currency: 'USD',
          commissionUsd: 1500,
          closedAt: new Date('2026-04-01'),
          notes: 'One year contract',
        },
      })

      expect(deal.transactionType).toBe('rent')
      expect(deal.notes).toBe('One year contract')

      await prisma.deal.delete({ where: { id: deal.id } })
      await prisma.client.delete({ where: { id: client.id } })
      await prisma.listing.delete({ where: { id: listing.id } })
    })

    it('should create deal with relations', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Related Client',
          whatsapp: '+8562066666666',
        },
      })

      const listing = await prisma.listing.create({
        data: {
          slug: `related-deal-${Date.now()}`,
          category: 'land',
          transaction: 'sale',
          titleEn: 'Land Deal',
          titleLo: 'Land Deal',
          titleZh: 'Land Deal',
          descriptionEn: 'Land for sale',
          descriptionLo: 'Land for sale',
          descriptionZh: 'Land for sale',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 80000,
        },
      })

      const deal = await prisma.deal.create({
        data: {
          clientId: client.id,
          listingId: listing.id,
          transactionType: 'sale',
          dealValue: 80000,
          commission: 4000,
          currency: 'USD',
          commissionUsd: 4000,
          closedAt: new Date('2026-04-10'),
        },
        include: {
          client: true,
          listing: true,
        },
      })

      expect(deal.client).toBeDefined()
      expect(deal.client.name).toBe('Related Client')
      expect(deal.listing).toBeDefined()
      expect(deal.listing.titleEn).toBe('Land Deal')

      await prisma.deal.delete({ where: { id: deal.id } })
      await prisma.client.delete({ where: { id: client.id } })
      await prisma.listing.delete({ where: { id: listing.id } })
    })
  })

  describe('READ', () => {
    it('should find a deal by id', async () => {
      const deal = await prisma.deal.findUnique({
        where: { id: testDealId },
      })

      expect(deal).toBeDefined()
      expect(deal?.id).toBe(testDealId)
    })

    it('should find deals by client', async () => {
      const deals = await prisma.deal.findMany({
        where: { clientId: testClient.id },
      })

      expect(Array.isArray(deals)).toBe(true)
      deals.forEach((deal) => {
        expect(deal.clientId).toBe(testClient.id)
      })
    })

    it('should find deals by listing', async () => {
      const deals = await prisma.deal.findMany({
        where: { listingId: testListing.id },
      })

      expect(Array.isArray(deals)).toBe(true)
      deals.forEach((deal) => {
        expect(deal.listingId).toBe(testListing.id)
      })
    })

    it('should find deals by transaction type', async () => {
      const sales = await prisma.deal.findMany({
        where: { transactionType: 'sale' },
        take: 5,
      })

      expect(Array.isArray(sales)).toBe(true)
      sales.forEach((deal) => {
        expect(deal.transactionType).toBe('sale')
      })
    })

    it('should include client and listing relations', async () => {
      const deal = await prisma.deal.findUnique({
        where: { id: testDealId },
        include: {
          client: true,
          listing: true,
        },
      })

      expect(deal).toBeDefined()
      expect(deal?.client).toBeDefined()
      expect(deal?.listing).toBeDefined()
      expect(deal?.client.id).toBe(testClient.id)
      expect(deal?.listing.id).toBe(testListing.id)
    })

    it('should find deals within date range', async () => {
      const startDate = new Date('2026-01-01')
      const endDate = new Date('2026-12-31')

      const deals = await prisma.deal.findMany({
        where: {
          closedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        take: 5,
      })

      expect(Array.isArray(deals)).toBe(true)
      deals.forEach((deal) => {
        expect(deal.closedAt >= startDate).toBe(true)
        expect(deal.closedAt <= endDate).toBe(true)
      })
    })
  })

  describe('UPDATE', () => {
    it('should update deal value and commission', async () => {
      const updated = await prisma.deal.update({
        where: { id: testDealId },
        data: {
          dealValue: 220000,
          commission: 11000,
          commissionUsd: 11000,
        },
      })

      expect(updated.dealValue).toBe(220000)
      expect(updated.commission).toBe(11000)
      expect(updated.commissionUsd).toBe(11000)
    })

    it('should update closed date', async () => {
      const newDate = new Date('2026-04-20')
      const updated = await prisma.deal.update({
        where: { id: testDealId },
        data: {
          closedAt: newDate,
        },
      })

      expect(updated.closedAt.toISOString().split('T')[0]).toBe(newDate.toISOString().split('T')[0])
    })

    it('should update notes', async () => {
      const updated = await prisma.deal.update({
        where: { id: testDealId },
        data: {
          notes: 'Updated deal notes with additional information',
        },
      })

      expect(updated.notes).toBe('Updated deal notes with additional information')
    })

    it('should clear notes', async () => {
      const updated = await prisma.deal.update({
        where: { id: testDealId },
        data: {
          notes: null,
        },
      })

      expect(updated.notes).toBeNull()
    })
  })

  describe('DELETE', () => {
    it('should delete a deal', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Delete Deal Client',
          whatsapp: '+8562055555555',
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

      await prisma.deal.delete({ where: { id: deal.id } })

      const found = await prisma.deal.findUnique({
        where: { id: deal.id },
      })

      expect(found).toBeNull()

      await prisma.client.delete({ where: { id: client.id } })
      await prisma.listing.delete({ where: { id: listing.id } })
    })
  })
})
