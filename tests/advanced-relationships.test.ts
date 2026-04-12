import { describe, it, expect, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Advanced Database Relationships', () => {
  let cleanupIds: { clients: string[]; listings: string[]; deals: string[] } = {
    clients: [],
    listings: [],
    deals: [],
  }

  afterAll(async () => {
    for (const dealId of cleanupIds.deals) {
      await prisma.deal.delete({ where: { id: dealId } }).catch(() => {})
    }
    for (const clientId of cleanupIds.clients) {
      await prisma.client.delete({ where: { id: clientId } }).catch(() => {})
    }
    for (const listingId of cleanupIds.listings) {
      await prisma.listing.delete({ where: { id: listingId } }).catch(() => {})
    }
  })

  describe('Cascade Deletes', () => {
    it('should cascade delete photos when listing is deleted', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `cascade-photo-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Cascade Photo Test',
          titleLo: 'Cascade Photo Test',
          titleZh: 'Cascade Photo Test',
          descriptionEn: 'Test',
          descriptionLo: 'Test',
          descriptionZh: 'Test',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 100000,
          photos: {
            create: [
              { url: 'https://example.com/photo1.jpg', order: 0 },
              { url: 'https://example.com/photo2.jpg', order: 1 },
            ],
          },
        },
        include: { photos: true },
      })

      const photoIds = listing.photos.map((p) => p.id)
      expect(photoIds.length).toBe(2)

      await prisma.listing.delete({ where: { id: listing.id } })

      for (const photoId of photoIds) {
        const photo = await prisma.photo.findUnique({ where: { id: photoId } })
        expect(photo).toBeNull()
      }
    })

    it('should cascade delete client listings when client is deleted', async () => {
      const listing = await prisma.listing.findFirst()
      if (!listing) return

      const client = await prisma.client.create({
        data: {
          name: 'Cascade Client Listing',
          whatsapp: '+8562099000001',
          listings: {
            create: [{ listingId: listing.id }],
          },
        },
      })

      await prisma.client.delete({ where: { id: client.id } })

      const clientListing = await prisma.clientListing.findFirst({
        where: { clientId: client.id },
      })

      expect(clientListing).toBeNull()
    })

    it('should cascade delete client listings when listing is deleted', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Test Client',
          whatsapp: '+8562099000002',
        },
      })
      cleanupIds.clients.push(client.id)

      const listing = await prisma.listing.create({
        data: {
          slug: `cascade-cl-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Cascade Test',
          titleLo: 'Cascade Test',
          titleZh: 'Cascade Test',
          descriptionEn: 'Test',
          descriptionLo: 'Test',
          descriptionZh: 'Test',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 100000,
          clientListings: {
            create: [{ clientId: client.id }],
          },
        },
      })

      await prisma.listing.delete({ where: { id: listing.id } })

      const clientListing = await prisma.clientListing.findFirst({
        where: { listingId: listing.id },
      })

      expect(clientListing).toBeNull()
    })
  })

  describe('Many-to-Many Operations', () => {
    it('should add multiple listings to a client', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Multi Listing Client',
          whatsapp: '+8562099000003',
        },
      })
      cleanupIds.clients.push(client.id)

      const listings = await prisma.listing.findMany({ take: 3 })

      if (listings.length < 2) return

      await prisma.client.update({
        where: { id: client.id },
        data: {
          listings: {
            create: listings.map((l) => ({ listingId: l.id })),
          },
        },
      })

      const clientWithListings = await prisma.client.findUnique({
        where: { id: client.id },
        include: { listings: true },
      })

      expect(clientWithListings?.listings.length).toBe(listings.length)
    })

    it('should add multiple clients to a listing', async () => {
      const listing = await prisma.listing.findFirst()
      if (!listing) return

      const client1 = await prisma.client.create({
        data: { name: 'Client 1', whatsapp: '+8562099000004' },
      })
      const client2 = await prisma.client.create({
        data: { name: 'Client 2', whatsapp: '+8562099000005' },
      })
      cleanupIds.clients.push(client1.id, client2.id)

      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          clientListings: {
            create: [{ clientId: client1.id }, { clientId: client2.id }],
          },
        },
      })

      const listingWithClients = await prisma.listing.findUnique({
        where: { id: listing.id },
        include: { clientListings: true },
      })

      const clientListingIds = listingWithClients?.clientListings.map((cl) => cl.clientId)
      expect(clientListingIds).toContain(client1.id)
      expect(clientListingIds).toContain(client2.id)
    })

    it('should remove client-listing association', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Remove Association Client',
          whatsapp: '+8562099000006',
        },
      })
      cleanupIds.clients.push(client.id)

      const listing = await prisma.listing.findFirst()
      if (!listing) return

      await prisma.clientListing.create({
        data: {
          clientId: client.id,
          listingId: listing.id,
        },
      })

      await prisma.clientListing.delete({
        where: {
          clientId_listingId: {
            clientId: client.id,
            listingId: listing.id,
          },
        },
      })

      const association = await prisma.clientListing.findUnique({
        where: {
          clientId_listingId: {
            clientId: client.id,
            listingId: listing.id,
          },
        },
      })

      expect(association).toBeNull()
    })
  })

  describe('Nested Includes', () => {
    it('should fetch listing with photos, area, and interested clients', async () => {
      const listing = await prisma.listing.findFirst({
        where: {
          photos: { some: {} },
          clientListings: { some: {} },
        },
        include: {
          photos: { orderBy: { order: 'asc' } },
          area: true,
          clientListings: {
            include: {
              client: true,
            },
          },
        },
      })

      if (listing) {
        expect(listing.photos).toBeDefined()
        expect(Array.isArray(listing.photos)).toBe(true)
        expect(listing.clientListings).toBeDefined()
        expect(Array.isArray(listing.clientListings)).toBe(true)
        listing.clientListings.forEach((cl) => {
          expect(cl.client).toHaveProperty('name')
          expect(cl.client).toHaveProperty('whatsapp')
        })
      }
    })

    it('should fetch client with listings and assigned agent', async () => {
      const client = await prisma.client.findFirst({
        where: {
          assignedTo: { not: null },
          listings: { some: {} },
        },
        include: {
          agent: true,
          listings: {
            include: {
              listing: {
                include: {
                  photos: { take: 1 },
                },
              },
            },
          },
        },
      })

      if (client) {
        expect(client.agent).toBeDefined()
        expect(client.listings).toBeDefined()
        expect(Array.isArray(client.listings)).toBe(true)
        client.listings.forEach((cl) => {
          expect(cl.listing).toHaveProperty('titleEn')
          expect(Array.isArray(cl.listing.photos)).toBe(true)
        })
      }
    })

    it('should fetch deal with all relations', async () => {
      const deal = await prisma.deal.findFirst({
        include: {
          client: {
            include: {
              agent: true,
            },
          },
          listing: {
            include: {
              photos: { take: 1 },
              area: true,
            },
          },
        },
      })

      if (deal) {
        expect(deal.client).toBeDefined()
        expect(deal.client).toHaveProperty('name')
        expect(deal.listing).toBeDefined()
        expect(deal.listing).toHaveProperty('titleEn')
        expect(Array.isArray(deal.listing.photos)).toBe(true)
      }
    })
  })

  describe('Foreign Key Constraints', () => {
    it('should prevent creating deal with non-existent client', async () => {
      const listing = await prisma.listing.findFirst()
      if (!listing) return

      await expect(async () => {
        await prisma.deal.create({
          data: {
            clientId: '00000000-0000-0000-0000-000000000000',
            listingId: listing.id,
            transactionType: 'sale',
            dealValue: 100000,
            commission: 5000,
            currency: 'USD',
            commissionUsd: 5000,
            closedAt: new Date(),
          },
        })
      }).rejects.toThrow()
    })

    it('should prevent creating deal with non-existent listing', async () => {
      const client = await prisma.client.findFirst()
      if (!client) return

      await expect(async () => {
        await prisma.deal.create({
          data: {
            clientId: client.id,
            listingId: '00000000-0000-0000-0000-000000000000',
            transactionType: 'sale',
            dealValue: 100000,
            commission: 5000,
            currency: 'USD',
            commissionUsd: 5000,
            closedAt: new Date(),
          },
        })
      }).rejects.toThrow()
    })

    it('should prevent assigning client to non-existent user', async () => {
      await expect(async () => {
        await prisma.client.create({
          data: {
            name: 'Bad Assignment',
            whatsapp: '+8562099000007',
            assignedTo: '00000000-0000-0000-0000-000000000000',
          },
        })
      }).rejects.toThrow()
    })
  })

  describe('Orphaned Records Prevention', () => {
    it('should set listing to null when inquiry listing is deleted', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `inquiry-test-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Inquiry Test',
          titleLo: 'Inquiry Test',
          titleZh: 'Inquiry Test',
          descriptionEn: 'Test',
          descriptionLo: 'Test',
          descriptionZh: 'Test',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 100000,
          inquiries: {
            create: {
              name: 'Test Inquirer',
              phone: '+8562099000008',
              message: 'Interested',
            },
          },
        },
        include: { inquiries: true },
      })

      const inquiryId = listing.inquiries[0].id

      await prisma.listing.delete({ where: { id: listing.id } })

      const inquiry = await prisma.inquiry.findUnique({
        where: { id: inquiryId },
      })

      expect(inquiry).toBeDefined()
      expect(inquiry?.listingId).toBeNull()

      await prisma.inquiry.delete({ where: { id: inquiryId } })
    })
  })
})
