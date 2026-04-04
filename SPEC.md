# SPEC.md
## PM Real Estate Laos

**Version:** 1.0  
**Date:** 2026-04-03

---

## 1. Environment Variables

```bash
# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Umami
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
NEXT_PUBLIC_UMAMI_URL=

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

---

## 2. Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  admin
  agent
}

enum PropertyType {
  land
  house
  rental
}

enum ListingStatus {
  available
  sold
  rented
  hidden
}

enum PriceUnit {
  total
  per_month
}

enum ClientStatus {
  new
  active
  closed
  lost
}

enum InterestType {
  land
  house
  rental
  any
}

enum ClientSource {
  website
  referral
  direct
  other
}

enum InquiryStatus {
  new
  contacted
  converted
  closed
}

enum ClientLanguage {
  en
  lo
  zh
  other
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(agent)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  clients   Client[]
}

model Listing {
  id              String        @id @default(uuid())
  slug            String        @unique
  type            PropertyType
  status          ListingStatus @default(available)
  featured        Boolean       @default(false)
  titleEn         String
  titleLo         String
  titleZh         String
  descriptionEn   String        @db.Text
  descriptionLo   String        @db.Text
  descriptionZh   String        @db.Text
  locationEn      String
  locationLo      String
  locationZh      String
  price           Decimal       @db.Decimal(12, 2)
  priceUnit       PriceUnit     @default(total)
  areaSqm         Decimal?      @db.Decimal(10, 2)
  lat             Decimal?      @db.Decimal(10, 7)
  lng             Decimal?      @db.Decimal(10, 7)
  photos          Photo[]
  inquiries       Inquiry[]
  clientListings  ClientListing[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model Photo {
  id          String   @id @default(uuid())
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  url         String
  order       Int      @default(0)
  createdAt   DateTime @default(now())
}

model Client {
  id             String         @id @default(uuid())
  name           String
  phone          String
  email          String?
  language       ClientLanguage @default(en)
  interestType   InterestType   @default(any)
  budgetMin      Decimal?       @db.Decimal(12, 2)
  budgetMax      Decimal?       @db.Decimal(12, 2)
  notes          String?        @db.Text
  status         ClientStatus   @default(new)
  source         ClientSource   @default(direct)
  lastContactAt  DateTime?
  assignedTo     String?
  agent          User?          @relation(fields: [assignedTo], references: [id])
  listings       ClientListing[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

model ClientListing {
  clientId   String
  listingId  String
  client     Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  listing    Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())

  @@id([clientId, listingId])
}

model Inquiry {
  id         String        @id @default(uuid())
  name       String
  phone      String
  message    String        @db.Text
  listingId  String?
  listing    Listing?      @relation(fields: [listingId], references: [id], onDelete: SetNull)
  status     InquiryStatus @default(new)
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
}
```

---

## 3. Locale Routing

Handled by `next-intl` via `middleware.ts`.

Supported locales: `en`, `lo`, `zh`  
Default locale: `en`  
Strategy: prefix all locales in URL — `/en/...`, `/lo/...`, `/zh/...`

```ts
// i18n.ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}))
```

```ts
// middleware.ts
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'lo', 'zh'],
  defaultLocale: 'en'
})

export const config = {
  matcher: ['/((?!admin|api|_next|.*\\..*).*)']
}
```

---

## 4. Authentication

NextAuth.js with Credentials provider. Session strategy: JWT.

- Admin panel protected via layout-level session check
- No public registration
- Admin creates user accounts manually
- Passwords hashed with bcrypt

```ts
// lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        if (!user || !user.active) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    }
  }
})
```

---

## 5. Cloudinary — Watermark Setup

### 5.1 Upload Preset

In the Cloudinary dashboard, create an upload preset named `pm_real_estate` with:

- Folder: `pm-real-estate/listings`
- Incoming transformation: overlay the watermark logo on upload
- Watermark position: bottom-right, with padding

### 5.2 Transformation String

```
l_pm-real-estate:watermark,g_south_east,x_20,y_20,o_70,w_150/fl_layer_apply
```

Upload the watermark PNG to Cloudinary under the folder `pm-real-estate` with the public ID `watermark`.

### 5.3 Server-Side Upload Route

```ts
// app/api/upload/route.ts
import { v2 as cloudinary } from 'cloudinary'
import { auth } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const buffer = Buffer.from(await file.arrayBuffer())

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { upload_preset: 'pm_real_estate' },
      (error, result) => error ? reject(error) : resolve(result)
    ).end(buffer)
  })

  return Response.json(result)
}
```

---

## 6. Map Coordinate Offset

Exact coordinates are never exposed to the browser. The offset is applied server-side before rendering.

```ts
// lib/mapOffset.ts
const OFFSET_RANGE = 0.004 // ~300–500 meters

export function offsetCoordinates(lat: number, lng: number) {
  const latOffset = (Math.random() - 0.5) * OFFSET_RANGE
  const lngOffset = (Math.random() - 0.5) * OFFSET_RANGE
  return {
    lat: lat + latOffset,
    lng: lng + lngOffset
  }
}
```

The offset is applied at request time in the property detail page server component. The raw coordinates never leave the server.

---

## 7. Inquiry Form — Email via Resend

```ts
// lib/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInquiryEmail(data: {
  name: string
  phone: string
  message: string
  listingTitle?: string
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.RESEND_FROM_EMAIL!,
    subject: `New Inquiry${data.listingTitle ? ` — ${data.listingTitle}` : ''}`,
    text: `
Name: ${data.name}
Phone/WhatsApp: ${data.phone}
Message: ${data.message}
${data.listingTitle ? `Listing: ${data.listingTitle}` : ''}
    `.trim()
  })
}
```

---

## 8. WhatsApp CTA

No bot, no API. A plain anchor tag with a pre-filled message.

```ts
// components/public/WhatsAppButton/WhatsAppButton.tsx
const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

export function WhatsAppButton({ listingTitle }: { listingTitle?: string }) {
  const message = listingTitle
    ? `Hi, I'm interested in: ${listingTitle}`
    : `Hi, I'd like to know more about your listings`

  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      WhatsApp Us
    </a>
  )
}
```

---

## 9. SEO

Each property detail page renders:

```tsx
export async function generateMetadata({ params }) {
  const listing = await getListingBySlug(params.slug, params.locale)
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 160),
      images: [listing.photos[0]?.url ?? '/og/og-default.jpg']
    }
  }
}
```

Schema.org structured data (`RealEstateListing`) injected as JSON-LD in each property detail page.

---

## 10. Slug Generation

Slugs are generated from the English title on listing creation.

```ts
// lib/utils.ts
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}
```

Slugs are unique. If a collision occurs, append a short UUID suffix.

---

## 11. Role-Based Access in Admin

| Action | admin | agent |
|--------|-------|-------|
| View listings | ✓ | ✓ |
| Create / edit listings | ✓ | ✓ |
| Delete listings | ✓ | ✗ |
| View clients | ✓ | ✓ |
| Create / edit clients | ✓ | ✓ |
| Delete clients | ✓ | ✗ |
| View inquiries | ✓ | ✓ |
| Convert inquiry to client | ✓ | ✓ |
| Manage users | ✓ | ✗ |

Role is checked server-side in API routes and admin page components.

---

*End of SPEC.md v1.0*