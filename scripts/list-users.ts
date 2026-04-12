/**
 * Script to list all users
 * 
 * Usage:
 *   npx tsx scripts/list-users.ts
 */

import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { accounts: true },
        },
      },
    })

    if (users.length === 0) {
      console.log('No users found.')
      return
    }

    console.log(`\n📋 Total Users: ${users.length}\n`)
    console.log('─'.repeat(100))

    users.forEach((user, index) => {
      const hasPassword = user.password ? '✓' : '✗'
      const hasOAuth = user._count.accounts > 0 ? '✓' : '✗'
      const status = user.active ? '🟢 Active' : '🔴 Inactive'

      console.log(`${index + 1}. ${user.name}`)
      console.log(`   Email:    ${user.email}`)
      console.log(`   Role:     ${user.role}`)
      console.log(`   Status:   ${status}`)
      console.log(`   Password: ${hasPassword}  |  OAuth: ${hasOAuth}`)
      console.log(`   Created:  ${user.createdAt.toLocaleDateString()}`)
      console.log('─'.repeat(100))
    })

    console.log('')
  } catch (error) {
    console.error('❌ Error listing users:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()
