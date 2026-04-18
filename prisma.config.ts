import { defineConfig } from 'prisma/config'
import { readFileSync } from 'fs'

try {
  for (const line of readFileSync('.env.local', 'utf-8').split('\n')) {
    const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
    if (m) process.env[m[1]] ??= m[2].replace(/^['"]|['"]$/g, '')
  }
} catch {}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
