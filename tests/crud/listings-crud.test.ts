import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Listings CRUD Operations', () => {
  let testListingId: string

  afterAll(async () => {
    if (testListingId) {
      await prisma.listing.delete({ where: { id: testListingId } }).catch(() => {})
    }
  })

  describe('CREATE', () => {
    it('should create a listing with required fields', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `test-listing-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Test House',
          titleLo: 'Test House',
          titleZh: 'Test House',
          descriptionEn: 'A beautiful test house',
          descriptionLo: 'A beautiful test house',
          descriptionZh: 'A beautiful test house',
          locationEn: 'Test Location',
          locationLo: 'Test Location',
          locationZh: 'Test Location',
          price: 100000,
        },
      })

      testListingId = listing.id
      expect(listing).toBeDefined()
      expect(listing.titleEn).toBe('Test House')
      expect(listing.category).toBe('house')
      expect(listing.transaction).toBe('sale')
      expect(listing.status).toBe('available')
      expect(listing.featured).toBe(false)
      expect(listing.sponsored).toBe(false)
    })

    it('should create a listing with optional fields', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `test-listing-full-${Date.now()}`,
          category: 'apartment',
          transaction: 'rent',
          status: 'available',
          featured: true,
          sponsored: true,
          sponsoredUntil: new Date('2026-12-31'),
          titleEn: 'Luxury Apartment',
          titleLo: 'Luxury Apartment',
          titleZh: 'Luxury Apartment',
          descriptionEn: 'Premium apartment',
          descriptionLo: 'Premium apartment',
          descriptionZh: 'Premium apartment',
          locationEn: 'Downtown',
          locationLo: 'Downtown',
          locationZh: 'Downtown',
          price: 2000,
          priceUnit: 'per_month',
          areaSqm: 150.5,
          bedrooms: 3,
          bathrooms: 2,
          parkingAvailable: true,
          swimmingPool: true,
          lat: 17.9757,
          lng: 102.6331,
        },
      })

      expect(listing.featured).toBe(true)
      expect(listing.sponsored).toBe(true)
      expect(listing.sponsoredUntil).toBeDefined()
      expect(listing.areaSqm?.toString()).toBe('150.5')
      expect(listing.bedrooms).toBe(3)
      expect(listing.bathrooms).toBe(2)
      expect(listing.parkingAvailable).toBe(true)
      expect(listing.swimmingPool).toBe(true)

      await prisma.listing.delete({ where: { id: listing.id } })
    })

    it('should create a listing with photos', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `test-listing-photos-${Date.now()}`,
          category: 'land',
          transaction: 'sale',
          titleEn: 'Land with Photos',
          titleLo: 'Land with Photos',
          titleZh: 'Land with Photos',
          descriptionEn: 'Beautiful land',
          descriptionLo: 'Beautiful land',
          descriptionZh: 'Beautiful land',
          locationEn: 'Countryside',
          locationLo: 'Countryside',
          locationZh: 'Countryside',
          price: 50000,
          photos: {
            create: [
              { url: 'https://example.com/photo1.jpg', order: 0 },
              { url: 'https://example.com/photo2.jpg', order: 1 },
            ],
          },
        },
        include: { photos: true },
      })

      expect(listing.photos).toHaveLength(2)
      expect(listing.photos[0].url).toBe('https://example.com/photo1.jpg')
      expect(listing.photos[1].url).toBe('https://example.com/photo2.jpg')

      await prisma.listing.delete({ where: { id: listing.id } })
    })
  })

  describe('READ', () => {
    it('should find a listing by id', async () => {
      const listing = await prisma.listing.findUnique({
        where: { id: testListingId },
      })

      expect(listing).toBeDefined()
      expect(listing?.id).toBe(testListingId)
    })

    it('should find a listing by slug', async () => {
      const listing = await prisma.listing.findUnique({
        where: { id: testListingId },
      })

      const foundBySlug = await prisma.listing.findUnique({
        where: { slug: listing!.slug },
      })

      expect(foundBySlug?.id).toBe(testListingId)
    })

    it('should find listings by category', async () => {
      const houses = await prisma.listing.findMany({
        where: { category: 'house' },
        take: 5,
      })

      expect(Array.isArray(houses)).toBe(true)
      houses.forEach((listing) => {
        expect(listing.category).toBe('house')
      })
    })

    it('should find listings by status', async () => {
      const available = await prisma.listing.findMany({
        where: { status: 'available' },
        take: 5,
      })

      expect(Array.isArray(available)).toBe(true)
      available.forEach((listing) => {
        expect(listing.status).toBe('available')
      })
    })

    it('should find featured listings', async () => {
      const featured = await prisma.listing.findMany({
        where: { featured: true },
        take: 5,
      })

      expect(Array.isArray(featured)).toBe(true)
      featured.forEach((listing) => {
        expect(listing.featured).toBe(true)
      })
    })

    it('should find sponsored listings', async () => {
      const sponsored = await prisma.listing.findMany({
        where: { sponsored: true },
        take: 5,
      })

      expect(Array.isArray(sponsored)).toBe(true)
      sponsored.forEach((listing) => {
        expect(listing.sponsored).toBe(true)
      })
    })

    it('should include photos when specified', async () => {
      const listing = await prisma.listing.findFirst({
        where: {
          photos: { some: {} },
        },
        include: { photos: true },
      })

      if (listing) {
        expect(listing.photos).toBeDefined()
        expect(Array.isArray(listing.photos)).toBe(true)
      }
    })
  })

  describe('UPDATE', () => {
    it('should update listing basic fields', async () => {
      const updated = await prisma.listing.update({
        where: { id: testListingId },
        data: {
          titleEn: 'Updated Test House',
          price: 150000,
        },
      })

      expect(updated.titleEn).toBe('Updated Test House')
      expect(updated.price.toString()).toBe('150000')
    })

    it('should update listing status', async () => {
      const updated = await prisma.listing.update({
        where: { id: testListingId },
        data: { status: 'sold' },
      })

      expect(updated.status).toBe('sold')

      await prisma.listing.update({
        where: { id: testListingId },
        data: { status: 'available' },
      })
    })

    it('should update featured flag', async () => {
      const updated = await prisma.listing.update({
        where: { id: testListingId },
        data: { featured: true },
      })

      expect(updated.featured).toBe(true)
    })

    it('should update sponsored fields', async () => {
      const sponsoredDate = new Date('2027-06-30')
      const updated = await prisma.listing.update({
        where: { id: testListingId },
        data: {
          sponsored: true,
          sponsoredUntil: sponsoredDate,
        },
      })

      expect(updated.sponsored).toBe(true)
      expect(updated.sponsoredUntil).toBeDefined()
    })

    it('should clear optional fields', async () => {
      const updated = await prisma.listing.update({
        where: { id: testListingId },
        data: {
          areaSqm: null,
          bedrooms: null,
          bathrooms: null,
        },
      })

      expect(updated.areaSqm).toBeNull()
      expect(updated.bedrooms).toBeNull()
      expect(updated.bathrooms).toBeNull()
    })
  })

  describe('DELETE', () => {
    it('should delete a listing', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `test-delete-${Date.now()}`,
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
          price: 1000,
        },
      })

      await prisma.listing.delete({ where: { id: listing.id } })

      const found = await prisma.listing.findUnique({
        where: { id: listing.id },
      })

      expect(found).toBeNull()
    })

    it('should cascade delete photos when listing is deleted', async () => {
      const listing = await prisma.listing.create({
        data: {
          slug: `test-cascade-${Date.now()}`,
          category: 'house',
          transaction: 'sale',
          titleEn: 'Cascade Test',
          titleLo: 'Cascade Test',
          titleZh: 'Cascade Test',
          descriptionEn: 'Test cascade',
          descriptionLo: 'Test cascade',
          descriptionZh: 'Test cascade',
          locationEn: 'Test',
          locationLo: 'Test',
          locationZh: 'Test',
          price: 1000,
          photos: {
            create: [
              { url: 'https://example.com/photo.jpg', order: 0 },
            ],
          },
        },
        include: { photos: true },
      })

      const photoId = listing.photos[0].id

      await prisma.listing.delete({ where: { id: listing.id } })

      const photo = await prisma.photo.findUnique({
        where: { id: photoId },
      })

      expect(photo).toBeNull()
    })
  })
})
