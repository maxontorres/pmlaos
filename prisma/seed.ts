import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('changeme', 12)

  await prisma.user.upsert({
    where: { email: 'admin@pmlaos.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@pmlaos.com',
      password,
      role: 'admin',
    },
  })

  console.log('Seeded admin user: admin@pmlaos.com / changeme')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
