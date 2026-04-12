import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Clients CRUD Operations', () => {
  let testClientId: string

  afterAll(async () => {
    if (testClientId) {
      await prisma.client.delete({ where: { id: testClientId } }).catch(() => {})
    }
  })

  describe('CREATE', () => {
    it('should create a client with required fields', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'John Doe',
          whatsapp: '+8562012345678',
        },
      })

      testClientId = client.id
      expect(client).toBeDefined()
      expect(client.name).toBe('John Doe')
      expect(client.whatsapp).toBe('+8562012345678')
      expect(client.status).toBe('new')
      expect(client.source).toBe('direct')
      expect(client.language).toBe('en')
      expect(client.interestType).toBe('any')
    })

    it('should create a client with all fields', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Jane Smith',
          whatsapp: '+8562087654321',
          email: 'jane@example.com',
          nationality: 'US',
          gender: 'female',
          speakLaoThai: true,
          speakEnglish: true,
          language: 'en',
          interestType: 'house_sale',
          budgetMin: 50000,
          budgetMax: 200000,
          notes: 'Interested in houses near international school',
          status: 'active',
          source: 'website',
        },
      })

      expect(client.email).toBe('jane@example.com')
      expect(client.nationality).toBe('US')
      expect(client.speakLaoThai).toBe(true)
      expect(client.speakEnglish).toBe(true)
      expect(client.interestType).toBe('house_sale')
      expect(client.budgetMin?.toString()).toBe('50000')
      expect(client.budgetMax?.toString()).toBe('200000')
      expect(client.status).toBe('active')
      expect(client.source).toBe('website')

      await prisma.client.delete({ where: { id: client.id } })
    })

    it('should create a client with agent assignment', async () => {
      const user = await prisma.user.findFirst({
        where: { active: true },
      })

      if (!user) {
        return
      }

      const client = await prisma.client.create({
        data: {
          name: 'Assigned Client',
          whatsapp: '+8562099999999',
          assignedTo: user.id,
        },
        include: { agent: true },
      })

      expect(client.assignedTo).toBe(user.id)
      expect(client.agent).toBeDefined()
      expect(client.agent?.id).toBe(user.id)

      await prisma.client.delete({ where: { id: client.id } })
    })
  })

  describe('READ', () => {
    it('should find a client by id', async () => {
      const client = await prisma.client.findUnique({
        where: { id: testClientId },
      })

      expect(client).toBeDefined()
      expect(client?.id).toBe(testClientId)
    })

    it('should find clients by status', async () => {
      const newClients = await prisma.client.findMany({
        where: { status: 'new' },
        take: 5,
      })

      expect(Array.isArray(newClients)).toBe(true)
      newClients.forEach((client) => {
        expect(client.status).toBe('new')
      })
    })

    it('should find clients by source', async () => {
      const websiteClients = await prisma.client.findMany({
        where: { source: 'website' },
        take: 5,
      })

      expect(Array.isArray(websiteClients)).toBe(true)
      websiteClients.forEach((client) => {
        expect(client.source).toBe('website')
      })
    })

    it('should find clients by interest type', async () => {
      const interested = await prisma.client.findMany({
        where: { interestType: 'house_sale' },
        take: 5,
      })

      expect(Array.isArray(interested)).toBe(true)
      interested.forEach((client) => {
        expect(client.interestType).toBe('house_sale')
      })
    })

    it('should find clients with budget range', async () => {
      const withBudget = await prisma.client.findMany({
        where: {
          AND: [
            { budgetMin: { not: null } },
            { budgetMax: { not: null } },
          ],
        },
        take: 5,
      })

      expect(Array.isArray(withBudget)).toBe(true)
      withBudget.forEach((client) => {
        expect(client.budgetMin).not.toBeNull()
        expect(client.budgetMax).not.toBeNull()
      })
    })

    it('should include agent when specified', async () => {
      const client = await prisma.client.findFirst({
        where: { assignedTo: { not: null } },
        include: { agent: true },
      })

      if (client) {
        expect(client.agent).toBeDefined()
        expect(client.agent?.id).toBe(client.assignedTo)
      }
    })
  })

  describe('UPDATE', () => {
    it('should update client basic fields', async () => {
      const updated = await prisma.client.update({
        where: { id: testClientId },
        data: {
          name: 'John Doe Updated',
          email: 'john.updated@example.com',
        },
      })

      expect(updated.name).toBe('John Doe Updated')
      expect(updated.email).toBe('john.updated@example.com')
    })

    it('should update client status', async () => {
      const updated = await prisma.client.update({
        where: { id: testClientId },
        data: { status: 'active' },
      })

      expect(updated.status).toBe('active')
    })

    it('should update client budget', async () => {
      const updated = await prisma.client.update({
        where: { id: testClientId },
        data: {
          budgetMin: 100000,
          budgetMax: 300000,
        },
      })

      expect(updated.budgetMin?.toString()).toBe('100000')
      expect(updated.budgetMax?.toString()).toBe('300000')
    })

    it('should update last contact date', async () => {
      const contactDate = new Date()
      const updated = await prisma.client.update({
        where: { id: testClientId },
        data: { lastContactAt: contactDate },
      })

      expect(updated.lastContactAt).toBeDefined()
    })

    it('should clear optional fields', async () => {
      const updated = await prisma.client.update({
        where: { id: testClientId },
        data: {
          email: null,
          nationality: null,
          budgetMin: null,
          budgetMax: null,
          notes: null,
        },
      })

      expect(updated.email).toBeNull()
      expect(updated.nationality).toBeNull()
      expect(updated.budgetMin).toBeNull()
      expect(updated.budgetMax).toBeNull()
      expect(updated.notes).toBeNull()
    })
  })

  describe('DELETE', () => {
    it('should delete a client', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'To Delete',
          whatsapp: '+8562011111111',
        },
      })

      await prisma.client.delete({ where: { id: client.id } })

      const found = await prisma.client.findUnique({
        where: { id: client.id },
      })

      expect(found).toBeNull()
    })

    it('should cascade delete client listings when client is deleted', async () => {
      const listing = await prisma.listing.findFirst()

      if (!listing) {
        return
      }

      const client = await prisma.client.create({
        data: {
          name: 'Cascade Test',
          whatsapp: '+8562022222222',
          listings: {
            create: [
              { listingId: listing.id },
            ],
          },
        },
        include: { listings: true },
      })

      expect(client.listings).toHaveLength(1)

      await prisma.client.delete({ where: { id: client.id } })

      const clientListing = await prisma.clientListing.findFirst({
        where: { clientId: client.id },
      })

      expect(clientListing).toBeNull()
    })
  })
})
