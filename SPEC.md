# SPEC.md
## PM Real Estate — ອະສັງຫາລິມະຊັບ
**Version:** 1.0  
**Date:** 2025  
**Domain:** PMLaos.com  
**Stack:** Next.js 14 · PostgreSQL · Prisma · Cloudinary · Vercel

> This is the technical source of truth for the PM Real Estate website.  
> It translates every requirement in the SRS into concrete implementation decisions.  
> When the SRS says *what*, this document says *how*.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Repository Structure](#2-repository-structure)
3. [Environment Variables](#3-environment-variables)
4. [Database Schema](#4-database-schema)
5. [i18n Architecture](#5-i18n-architecture)
6. [Routing Map](#6-routing-map)
7. [Public Site — Implementation](#7-public-site--implementation)
8. [Admin Panel — Implementation](#8-admin-panel--implementation)
9. [API Routes](#9-api-routes)
10. [Authentication](#10-authentication)
11. [Image Upload Flow](#11-image-upload-flow)
12. [Coordinate Picker](#12-coordinate-picker)
13. [SEO Strategy](#13-seo-strategy)
14. [Location Privacy Rules](#14-location-privacy-rules)
15. [Component Map](#15-component-map)

---

## 1. Tech Stack

| Layer | Technology | Version | Reason |
|-------|-----------|---------|--------|
| Framework | Next.js (App Router) | 14 | SSG for SEO, built-in i18n routing, API routes — one repo |
| Language | TypeScript | 5 | Type safety across DB, API, and UI |
| Styling | CSS Modules | — | No Tailwind — scoped styles per component, no class bloat |
| Database | PostgreSQL | 15 | Relational, handles complex listing filters well |
| DB Host | Supabase | Free tier | Hosted Postgres, connection pooling via pgBouncer |
| ORM | Prisma | 5 | Type-safe queries, migration management |
| Images | Cloudinary | Free tier | On-the-fly resizing, auto-format (WebP), CDN delivery |
| i18n | next-intl | 3 | Best-in-class `/en` `/lo` URL routing for Next.js App Router |
| Auth | iron-session | 8 | Lightweight encrypted cookie sessions — no OAuth needed for 1 admin |
| Maps | Google Maps Embed API | — | Free embed, no billing for embed usage |
| Email | Resend | Free tier | Optional — 50 emails/day, inquiry notifications |
| Deployment | Vercel | Free tier | Zero-config Next.js, preview URLs per PR |

---

## 2. Repository Structure

```
pm-real-estate/
├── app/
│   ├── [locale]/                        # Dynamic locale segment: 'lo' | 'en'
│   │   ├── layout.tsx                   # Locale layout — sets html lang, loads Noto Sans Lao for 'lo'
│   │   ├── page.tsx                     # Homepage
│   │   ├── listings/
│   │   │   ├── page.tsx                 # Listing index — filter bar + paginated grid
│   │   │   └── [slug]/
│   │   │       └── page.tsx             # Listing detail page
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   │
│   ├── admin/                           # NOT locale-prefixed — internal only
│   │   ├── layout.tsx                   # Auth guard — redirects to /admin/login if no session
│   │   ├── page.tsx                     # Dashboard — summary stats
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── listings/
│   │   │   ├── page.tsx                 # Listings table with search + filter
│   │   │   ├── new/
│   │   │   │   └── page.tsx             # Create listing form
│   │   │   └── [id]/
│   │   │       └── page.tsx             # Edit listing form
│   │   ├── inquiries/
│   │   │   └── page.tsx                 # All inquiries grouped by listing
│   │   └── clients/
│   │       ├── page.tsx                 # Client list
│   │       ├── new/
│   │       │   └── page.tsx             # Create client form
│   │       └── [id]/
│   │           └── page.tsx             # Client detail — linked listings + deal status
│   │
│   ├── api/
│   │   ├── listings/
│   │   │   ├── route.ts                 # GET (public, filtered) · POST (admin)
│   │   │   └── [id]/
│   │   │       └── route.ts             # GET · PUT · DELETE (admin)
│   │   ├── inquiries/
│   │   │   └── route.ts                 # POST (public) · GET (admin)
│   │   ├── clients/
│   │   │   ├── route.ts                 # GET · POST (admin)
│   │   │   └── [id]/
│   │   │       └── route.ts             # GET · PUT · DELETE (admin)
│   │   └── auth/
│   │       └── route.ts                 # POST login · DELETE logout
│   │
│   ├── layout.tsx                       # Root layout
│   ├── globals.css
│   └── sitemap.ts                       # Dynamic sitemap — all active listings × 2 locales
│
├── components/
│   ├── ui/                              # Primitives — Button, Input, Select, Badge, Dialog
│   ├── listings/
│   │   ├── ListingCard.tsx
│   │   ├── ListingGrid.tsx
│   │   ├── FilterBar.tsx
│   │   └── PhotoGallery.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── forms/
│   │   ├── InquiryForm.tsx
│   │   ├── AdminListingForm.tsx
│   │   └── AdminClientForm.tsx
│   └── maps/
│       ├── CoordinatePicker.tsx         # Click-to-set lat/lng (admin only)
│       ├── MapPreview.tsx               # Read-only pin preview (admin only)
│       └── OfficeMap.tsx                # Static embed for Contact page (public)
│
├── lib/
│   ├── db.ts                            # Prisma client singleton
│   ├── auth.ts                          # iron-session config + helpers
│   ├── cloudinary.ts                    # Upload helper
│   ├── slugify.ts                       # English title → URL slug
│   └── utils.ts                         # formatPrice(), cn()
│
├── messages/
│   ├── en.json                          # All English UI strings
│   └── lo.json                          # All Lao UI strings
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                          # Initial listings from Facebook page
│   └── migrations/
│
├── public/
│   ├── logo.png
│   └── og-default.jpg                   # Default OG image (PM logo on navy background)
│
├── middleware.ts                        # Locale detection + redirect / → /lo
├── i18n.ts                              # next-intl config
├── i18n.request.ts                      # Server-side locale resolution
├── next.config.ts
├── .env.local
└── package.json
```

---

## 3. Environment Variables

All secrets are stored in `.env.local` locally and in Vercel environment variables for production. **Never hardcode any of these values.**

```bash
# Database
DATABASE_URL="postgresql://..."           # Supabase connection string (with pgBouncer)
DIRECT_URL="postgresql://..."             # Direct URL for Prisma migrations (no pooler)

# Admin Auth
ADMIN_EMAIL="admin@pmlaos.com"
ADMIN_PASSWORD_HASH="$2b$10$..."          # bcrypt hash — generate with: node -e "require('bcrypt').hash('yourpassword',10).then(console.log)"
SESSION_SECRET="32-char-random-string"    # Generate with: openssl rand -hex 16

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_UPLOAD_PRESET="pm-listings"   # Unsigned upload preset

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."     # Must be NEXT_PUBLIC_ for client-side embed

# Email (optional)
RESEND_API_KEY="re_..."
RESEND_TO_EMAIL="notify@pmlaos.com"
```

---

## 4. Database Schema

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum ListingType {
  RENT_HOUSE
  RENT_APT
  SALE_HOUSE
  SALE_LAND
}

enum ListingStatus {
  ACTIVE
  RENTED_SOLD
  DRAFT
}

enum DealStatus {
  INTERESTED
  NEGOTIATING
  CLOSED
}

model Listing {
  id         Int           @id @default(autoincrement())
  slug       String        @unique
  type       ListingType
  status     ListingStatus @default(ACTIVE)

  // Bilingual content
  titleEn    String
  titleLo    String
  descEn     String        @db.Text
  descLo     String        @db.Text

  // Pricing (at least one should be set)
  priceKip   BigInt?
  priceUsd   Float?

  // Specs (optional for land)
  bedrooms   Int?
  bathrooms  Int?
  areaSqm    Float?

  // Location — district is public; address/lat/lng are admin-only
  district   String
  address    String?
  lat        Float?
  lng        Float?

  // Media
  images     String[]      // Cloudinary URLs — first image is thumbnail

  // Flags
  featured   Boolean       @default(false)

  // Timestamps
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  // Relations
  inquiries      Inquiry[]
  clientListings ClientListing[]
}

model Inquiry {
  id        Int      @id @default(autoincrement())
  listingId Int
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  name      String
  phone     String
  message   String   @db.Text
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Client {
  id        Int      @id @default(autoincrement())
  name      String
  phone     String
  notes     String?  @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  clientListings ClientListing[]
}

model ClientListing {
  id        Int        @id @default(autoincrement())
  clientId  Int
  listingId Int
  status    DealStatus @default(INTERESTED)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  client  Client  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([clientId, listingId])         // One link per client–listing pair
}
```

---

## 5. i18n Architecture

### URL Structure

```
/                     → redirected to /lo (middleware.ts)
/lo                   → Lao homepage (default locale)
/en                   → English homepage
/lo/listings          → Lao listings index
/en/listings          → English listings index
/lo/listings/[slug]   → Lao listing detail
/en/listings/[slug]   → English listing detail
/lo/about             → Lao about page
/lo/contact           → Lao contact page
/admin/...            → Admin panel (no locale prefix)
```

### middleware.ts

```ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['lo', 'en'],
  defaultLocale: 'lo',
});

export const config = {
  matcher: ['/((?!admin|api|_next|.*\\..*).*)'],
};
```

### Message Files

All UI strings live in `messages/en.json` and `messages/lo.json`. **No hardcoded strings in components.**

```json
// messages/en.json (excerpt)
{
  "nav": {
    "listings": "Listings",
    "about": "About Us",
    "contact": "Contact"
  },
  "listing": {
    "inquire": "Send Inquiry",
    "whatsapp": "Chat on WhatsApp",
    "call": "Call Agent",
    "bedrooms": "{count} Bedrooms",
    "district": "District"
  },
  "filters": {
    "type": "Property Type",
    "district": "District",
    "minPrice": "Min Price",
    "maxPrice": "Max Price",
    "bedrooms": "Bedrooms"
  }
}
```

### Lao Font

In `app/[locale]/layout.tsx`:

```tsx
import { Noto_Sans_Lao } from 'next/font/google';

const notoSansLao = Noto_Sans_Lao({ subsets: ['lao'] });

export default function LocaleLayout({ children, params: { locale } }) {
  return (
    <html lang={locale} className={locale === 'lo' ? notoSansLao.className : ''}>
      <body>{children}</body>
    </html>
  );
}
```

### Language Switcher Logic

The switcher replaces only the locale segment of the current pathname — the user stays on the same page.

```tsx
// components/layout/LanguageSwitcher.tsx
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const otherLocale = currentLocale === 'lo' ? 'en' : 'lo';
  const switchedPath = pathname.replace(`/${currentLocale}`, `/${otherLocale}`);

  return (
    <Link href={switchedPath}>
      {otherLocale === 'en' ? 'EN' : 'ລາວ'}
    </Link>
  );
}
```

---

## 6. Routing Map

### Public Routes

| URL | Page | Rendering |
|-----|------|-----------|
| `/` | — | Redirect → `/lo` (middleware) |
| `/{locale}` | Homepage | SSG |
| `/{locale}/listings` | Listing index | SSR (filters via query string) |
| `/{locale}/listings/[slug]` | Listing detail | SSG (`generateStaticParams`) |
| `/{locale}/about` | About Us | SSG |
| `/{locale}/contact` | Contact | SSG |

### Admin Routes

| URL | Page | Notes |
|-----|------|-------|
| `/admin` | Dashboard | Session-protected |
| `/admin/login` | Login | Public |
| `/admin/listings` | Listings table | Session-protected |
| `/admin/listings/new` | Create listing | Session-protected |
| `/admin/listings/[id]` | Edit listing | Session-protected |
| `/admin/inquiries` | Inquiries list | Session-protected |
| `/admin/clients` | Client list | Session-protected |
| `/admin/clients/new` | Create client | Session-protected |
| `/admin/clients/[id]` | Client detail | Session-protected |

---

## 7. Public Site — Implementation

### 7.1 Homepage

- **Hero banner:** Full-width image with tagline in current locale + CTA button → `/listings`
- **Featured listings:** `WHERE featured = true AND status = 'ACTIVE'` — max 6, displayed as `ListingCard` grid
- **Contact CTA:** WhatsApp deep link + phone number

### 7.2 Listing Index Page

Rendered as SSR to support filter query strings.

**URL pattern:** `/{locale}/listings?type=RENT_HOUSE&district=Sikhottabong&minPrice=500&maxPrice=1500&bedrooms=2&page=1`

**Filter bar inputs:**
- Type: `<select>` — Rent House, Rent Apartment, Sale House, Sale Land
- District: `<select>` — all 9 Vientiane districts
- Price: two `<input type="number">` — min/max (USD)
- Bedrooms: `<select>` — 1, 2, 3, 4+

On filter change → update URL query string → page re-renders with new results.

**Pagination:** 12 listings per page. Page links update `?page=N` in URL.

**Empty state:** "No listings found. Contact PM Real Estate directly." + WhatsApp link.

### 7.3 Listing Detail Page

Generated statically at build time for all `ACTIVE` listings via `generateStaticParams`.

**What is shown:**
- Photo gallery (swipeable on mobile via CSS scroll snap — no JS library needed)
- Title in current locale
- Type badge + status badge
- Specs: price (LAK and/or USD), bedrooms, bathrooms, area (sqm), district name
- Full description in current locale
- Inquiry form
- WhatsApp button: `https://wa.me/{PHONE}?text=I'm interested in: {titleEn}`
- Call button: `tel:{PHONE}`

**What is never shown:** address, lat, lng, map pin.

### 7.4 Inquiry Form

Client-side form, submits to `POST /api/inquiries`.

```ts
// Validation (server-side in route handler)
const schema = z.object({
  listingId: z.number(),
  name: z.string().min(2),
  phone: z.string().min(8),
  message: z.string().min(5),
});
```

On success: show "Thank you" message. On error: show inline field errors.

---

## 8. Admin Panel — Implementation

### 8.1 Auth Guard

`app/admin/layout.tsx` is a **server component** that checks the session on every render:

```ts
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session.isLoggedIn) redirect('/admin/login');
  return <>{children}</>;
}
```

### 8.2 Dashboard

Displays at a glance:
- Count of `ACTIVE` listings
- Count of `DRAFT` listings
- Count of unread inquiries (`read = false`)
- Count of total clients
- Quick links: New Listing, View Inquiries, View Clients

### 8.3 Listings Table (`/admin/listings`)

- Search input: filters by `titleEn` or `titleLo` (ILIKE)
- Filter dropdowns: type, status, district
- Columns: thumbnail, title (EN), type, district, price, status badge, Edit / Delete
- Status can be changed inline via a `<select>` — fires `PUT /api/listings/[id]`
- Featured toggle inline — fires `PUT /api/listings/[id]`
- Delete: opens confirm `<dialog>` — fires `DELETE /api/listings/[id]`

### 8.4 Listing Form (Create + Edit)

Fields grouped into sections:

**Content**
- Title EN (`<input>`)
- Title LO (`<input>`)
- Description EN (`<textarea>`)
- Description LO (`<textarea>`)

**Classification**
- Type (`<select>`: RENT_HOUSE, RENT_APT, SALE_HOUSE, SALE_LAND)
- Status (`<select>`: ACTIVE, DRAFT, RENTED_SOLD)
- Featured (`<input type="checkbox">`)

**Pricing**
- Price LAK (`<input type="number">`)
- Price USD (`<input type="number">`)

**Specs** (hidden for SALE_LAND)
- Bedrooms (`<input type="number">`)
- Bathrooms (`<input type="number">`)
- Area sqm (`<input type="number">`)

**Location**
- District (`<select>` — 9 Vientiane districts)
- Address (`<input>`) — internal only
- Coordinate Picker — see Section 12

**Images**
- Multi-file upload — see Section 11

### 8.5 Inquiries Page (`/admin/inquiries`)

- Grouped by listing — listing title as section header
- Each inquiry shows: name, phone, message, date, read/unread badge
- Clicking an unread inquiry marks it as read (`PATCH /api/inquiries/[id]`)

### 8.6 Clients

**Client list (`/admin/clients`):**
- Columns: name, phone, number of linked listings, date added
- Link to client detail page

**Client detail (`/admin/clients/[id]`):**
- Editable name, phone, notes
- Table of linked listings — each row shows: listing title, type, status badge, deal status dropdown
- Deal status dropdown updates `ClientListing.status` inline via `PUT /api/clients/[id]/listings/[listingId]`
- "Link listing" dropdown — searches active listings by title, creates a new `ClientListing`
- Unlink button — deletes the `ClientListing` row

---

## 9. API Routes

All admin-write routes check session before executing. Public routes are read-only.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/listings` | Public | Filtered, paginated listing query |
| `POST` | `/api/listings` | Admin | Create listing |
| `GET` | `/api/listings/[id]` | Admin | Get single listing (all fields including address/lat/lng) |
| `PUT` | `/api/listings/[id]` | Admin | Update listing |
| `DELETE` | `/api/listings/[id]` | Admin | Delete listing |
| `POST` | `/api/inquiries` | Public | Submit inquiry from listing page |
| `GET` | `/api/inquiries` | Admin | All inquiries |
| `PATCH` | `/api/inquiries/[id]` | Admin | Mark as read |
| `GET` | `/api/clients` | Admin | All clients |
| `POST` | `/api/clients` | Admin | Create client |
| `GET` | `/api/clients/[id]` | Admin | Client detail with linked listings |
| `PUT` | `/api/clients/[id]` | Admin | Update client |
| `DELETE` | `/api/clients/[id]` | Admin | Delete client |
| `POST` | `/api/clients/[id]/listings` | Admin | Link listing to client |
| `PUT` | `/api/clients/[id]/listings/[listingId]` | Admin | Update deal status |
| `DELETE` | `/api/clients/[id]/listings/[listingId]` | Admin | Unlink listing from client |
| `POST` | `/api/auth` | Public | Login |
| `DELETE` | `/api/auth` | Admin | Logout |

### Admin Auth Check Helper

```ts
// lib/auth.ts
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
```

---

## 10. Authentication

Single admin account. No registration, no password reset UI.

### Login Flow

```
POST /api/auth
Body: { email, password }

1. Compare email to process.env.ADMIN_EMAIL
2. Compare password to process.env.ADMIN_PASSWORD_HASH using bcrypt.compare()
3. If valid → set session: { isLoggedIn: true }
4. Return 200
5. If invalid → return 401
```

### Session Config

```ts
// lib/auth.ts
import { SessionOptions } from 'iron-session';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'pm-admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,              // 7 days
  },
};
```

### Generating a Password Hash

```bash
node -e "require('bcryptjs').hash('yourpassword', 10).then(h => console.log(h))"
# Copy the output into ADMIN_PASSWORD_HASH env var
```

---

## 11. Image Upload Flow

Images upload **directly from the browser to Cloudinary** — no server proxy, no storage on Vercel.

```
1. Admin selects files in <input type="file" multiple accept="image/*">
2. For each file:
   - POST to https://api.cloudinary.com/v1_1/{CLOUD_NAME}/image/upload
   - Body: FormData with { file, upload_preset: 'pm-listings' }
3. Cloudinary returns { secure_url, public_id }
4. secure_url is appended to a local images[] state array
5. On form submit, images[] is sent as part of the listing payload
6. Stored as String[] in Listing.images
```

### Cloudinary Upload Preset Settings

In Cloudinary dashboard, create an **unsigned** preset named `pm-listings` with:
- Folder: `pm-real-estate/listings`
- Transformation: `w_1200,h_800,c_limit,q_auto,f_auto`

### Displaying Images

```tsx
// Use next/image with a Cloudinary loader
import Image from 'next/image';

<Image
  src={imageUrl}
  alt={listing.titleEn}
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

Add `images.cloudinary.com` to `next.config.ts` remote patterns.

---

## 12. Coordinate Picker

Used in the admin listing create/edit form. Allows staff to click on a map to set `lat`/`lng` — no manual number entry.

### Implementation

Uses the **Google Maps JavaScript API** (client-side, in admin only).

```tsx
// components/maps/CoordinatePicker.tsx
'use client';
import { useEffect, useRef } from 'react';

export function CoordinatePicker({
  lat, lng, onChange
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Center on Vientiane by default
    const defaultCenter = { lat: 17.9757, lng: 102.6331 };
    const map = new google.maps.Map(mapRef.current!, {
      center: lat && lng ? { lat, lng } : defaultCenter,
      zoom: 13,
    });

    const marker = new google.maps.Marker({
      map,
      position: lat && lng ? { lat, lng } : defaultCenter,
      draggable: true,
    });

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      marker.setPosition(e.latLng);
      onChange(e.latLng!.lat(), e.latLng!.lng());
    });

    marker.addListener('dragend', () => {
      const pos = marker.getPosition()!;
      onChange(pos.lat(), pos.lng());
    });
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '300px' }} />;
}
```

### Map Preview (Edit Page)

A read-only embed shown below the coordinate picker once `lat`/`lng` are saved:

```tsx
// components/maps/MapPreview.tsx
export function MapPreview({ lat, lng }: { lat: number; lng: number }) {
  const src = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${lat},${lng}&zoom=15`;
  return (
    <iframe
      src={src}
      width="100%"
      height="250"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
```

---

## 13. SEO Strategy

### Static Generation

All `ACTIVE` listing pages are pre-rendered at build time:

```ts
// app/[locale]/listings/[slug]/page.tsx
export async function generateStaticParams() {
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true },
  });
  const locales = ['lo', 'en'];
  return locales.flatMap(locale =>
    listings.map(l => ({ locale, slug: l.slug }))
  );
}
```

### Metadata

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const listing = await getListingBySlug(params.slug);
  const isEn = params.locale === 'en';

  return {
    title: isEn ? listing.titleEn : listing.titleLo,
    description: isEn
      ? listing.descEn.slice(0, 160)
      : listing.descLo.slice(0, 160),
    openGraph: {
      images: [{ url: listing.images[0] }],
    },
  };
}
```

### Sitemap

```ts
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, updatedAt: true },
  });

  const locales = ['lo', 'en'];
  const listingUrls = locales.flatMap(locale =>
    listings.map(l => ({
      url: `https://pmlaos.com/${locale}/listings/${l.slug}`,
      lastModified: l.updatedAt,
    }))
  );

  const staticPages = locales.flatMap(locale =>
    ['', '/listings', '/about', '/contact'].map(path => ({
      url: `https://pmlaos.com/${locale}${path}`,
      lastModified: new Date(),
    }))
  );

  return [...staticPages, ...listingUrls];
}
```

### robots.ts

```ts
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/admin' },
    ],
    sitemap: 'https://pmlaos.com/sitemap.xml',
  };
}
```

---

## 14. Location Privacy Rules

> **This is a hard business rule — not a UI preference.**
> The broker relationship with property owners depends on clients not having direct access to property locations.

### Rules

1. `address`, `lat`, `lng` fields are **never returned by `GET /api/listings`** (public route)
2. The public listing detail page (`[slug]/page.tsx`) **never renders** address, coordinates, or a map pin
3. `GET /api/listings/[id]` (admin route) returns all fields including location data
4. The admin listing form shows address, coordinate picker, and map preview
5. Prisma queries for public pages must **explicitly select** only safe fields — never use `select: *`

### Safe Public Select

```ts
// lib/db.ts
export const publicListingSelect = {
  id: true,
  slug: true,
  type: true,
  status: true,
  titleEn: true,
  titleLo: true,
  descEn: true,
  descLo: true,
  priceKip: true,
  priceUsd: true,
  bedrooms: true,
  bathrooms: true,
  areaSqm: true,
  district: true,   // ✅ district is public
  images: true,
  featured: true,
  createdAt: true,
  // address: false  ❌ never exposed
  // lat: false      ❌ never exposed
  // lng: false      ❌ never exposed
};
```

---

## 15. Component Map

| Component | Route | Notes |
|-----------|-------|-------|
| `Navbar` | All public `[locale]` pages | Logo, nav links, LanguageSwitcher |
| `Footer` | All public `[locale]` pages | Phone, WhatsApp, Facebook link, copyright |
| `LanguageSwitcher` | Inside Navbar | Swaps `/lo` ↔ `/en` in current URL |
| `ListingCard` | Homepage, `/listings` | Thumbnail, locale title, price, type badge, district |
| `ListingGrid` | Homepage, `/listings` | Responsive grid of ListingCards |
| `FilterBar` | `/listings` | Type, district, price range, bedrooms dropdowns |
| `PhotoGallery` | `/listings/[slug]` | CSS scroll snap, swipeable on mobile |
| `InquiryForm` | `/listings/[slug]` | Name, phone, message — POST to /api/inquiries |
| `OfficeMap` | `/contact` | Google Maps embed for PM office location only |
| `CoordinatePicker` | `/admin/listings/new`, `/admin/listings/[id]` | Click-to-set lat/lng |
| `MapPreview` | `/admin/listings/[id]` | Read-only pin preview after coordinates are set |
| `AdminListingForm` | `/admin/listings/new`, `/admin/listings/[id]` | Full listing create/edit form |
| `AdminClientForm` | `/admin/clients/new`, `/admin/clients/[id]` | Client create/edit + listing links |