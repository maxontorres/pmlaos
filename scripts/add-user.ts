/**
 * Script to add authorized users for Google Sign-In
 * 
 * Usage:
 *   npx tsx scripts/add-user.ts email@example.com "Full Name" agent
 *   npx tsx scripts/add-user.ts email@example.com "Full Name" admin
 */

import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function addUser() {
  const [email, name, role] = process.argv.slice(2)

  if (!email || !name) {
    console.error('❌ Usage: npx tsx scripts/add-user.ts email@example.com "Full Name" [agent|admin]')
    process.exit(1)
  }

  if (role && role !== 'agent' && role !== 'admin') {
    console.error('❌ Role must be either "agent" or "admin"')
    process.exit(1)
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log(`⚠️  User already exists: ${email}`)
      console.log(`   Name: ${existingUser.name}`)
      console.log(`   Role: ${existingUser.role}`)
      console.log(`   Active: ${existingUser.active}`)
      return
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: (role as 'agent' | 'admin') || 'agent',
        active: true,
      },
    })

    console.log('✅ User created successfully!')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log('')
    console.log('👉 This user can now sign in with Google')
  } catch (error) {
    console.error('❌ Error creating user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

addUser()
