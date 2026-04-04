# Build Roadmap
## PM Real Estate Laos

**Version:** 1.0  
**Date:** 2026-04-03

---

## Overview

The build is split into 6 phases. Each phase produces a working, testable result. Nothing is built speculatively — every phase has a clear deliverable.

| Phase | Focus | Deliverable |
|-------|-------|-------------|
| 1 | Project bootstrap | Running app, DB connected, auth working |
| 2 | Listings manager | Admin can create and manage listings |
| 3 | Public site | Listings visible to the world |
| 4 | CRM | Client and inquiry management |
| 5 | Polish | SEO, i18n completeness, mobile |
| 6 | Launch | Deploy, DNS, Cloudinary watermark live |

---

## Phase 1 — Bootstrap

**Goal:** Working Next.js app connected to the database with authentication.

### 1.1 Project init

- `npx create-next-app@latest pm-real-estate --typescript --no-tailwind --no-src-dir --app`
- Delete boilerplate pages and CSS
- Set up CSS Modules reset and base styles
- Configure `next.config.ts`
- Create `.env.local` with all required keys (empty values)

### 1.2 Database

- Create Neon project, copy `DATABASE_URL`
- Install Prisma: `npm install prisma @prisma/client`
- `npx prisma init`
- Write full `schema.prisma` from SPEC.md
- `npx prisma migrate dev --name init`
- Create `lib/prisma.ts` singleton

### 1.3 Authentication

- Install NextAuth: `npm install next-auth bcryptjs`
- Implement `lib/auth.ts` from SPEC.md
- Create `app/api/auth/[...nextauth]/route.ts`
- Build `/admin/login` page — email + password form
- Build `app/admin/layout.tsx` — session guard, redirect to login if unauthenticated
- Seed one admin user via `prisma/seed.ts`
- Test: login works, unauthenticated users cannot access `/admin`

### 1.4 i18n scaffold

- Install next-intl: `npm install next-intl`
- Create `i18n.ts` and `middleware.ts` from SPEC.md
- Create `messages/en.json`, `messages/lo.json`, `messages/zh.json` with placeholder keys
- Wrap `app/[locale]/layout.tsx` with `NextIntlClientProvider`
- Test: `/en`, `/lo`, `/zh` all resolve without errors

---

## Phase 2 — Listings Manager (Admin)

**Goal:** Admin can create, edit, delete, and manage listings including photo uploads with automatic watermarking.

### 2.1 Cloudinary setup

- Create Cloudinary account
- Upload watermark PNG to Cloudinary under public ID `pm-real-estate/watermark`
- Create upload preset `pm_real_estate` with watermark overlay transformation
- Add Cloudinary keys to `.env.local`
- Install SDK: `npm install cloudinary`
- Create `lib/cloudinary.ts`
- Implement `app/api/upload/route.ts` from SPEC.md
- Test: upload a photo via Postman or curl, confirm watermark appears on returned URL

### 2.2 Listings API

- Implement `app/api/listings/route.ts` — GET all, POST new
- Implement `app/api/listings/[id]/route.ts` — GET one, PUT, DELETE
- All routes require authenticated session
- DELETE restricted to admin role

### 2.3 Admin listings UI

- Build `app/admin/listings/page.tsx` — table of all listings with status badges, edit and delete actions
- Build `app/admin/listings/new/page.tsx` — listing creation form
- Build `app/admin/listings/[id]/page.tsx` — edit form, pre-populated
- Build `components/admin/ListingForm` — shared form component used by new and edit pages
- Build `components/admin/PhotoUploader` — drag and drop, calls `/api/upload`, previews returned URLs, supports reordering

### 2.4 Listing form fields

The form covers all fields from the schema:
- Type (land / house / rental)
- Status (available / sold / rented / hidden)
- Featured toggle
- Title in EN, LO, ZH
- Description in EN, LO, ZH (textarea)
- General location in EN, LO, ZH
- Price + price unit (total / per month)
- Area in sqm
- Coordinates (lat/lng) — entered manually or via a simple map click
- Photos — upload, preview, reorder, delete

### 2.5 Admin sidebar and layout

- Build `components/admin/Sidebar` — navigation links: Dashboard, Listings, Clients, Inquiries, Users (admin only)
- Build `components/admin/AdminLayout` — wraps all admin pages
- Build `app/admin/page.tsx` — dashboard with counts: total listings, available listings, total clients, new inquiries

---

## Phase 3 — Public Site

**Goal:** The public-facing site is live with all listings browsable and property detail pages working.

### 3.1 Listings page

- Build `app/[locale]/listings/page.tsx` — fetches all available listings server-side
- Build `components/public/ListingGrid` — responsive grid layout
- Build `components/public/ListingCard` — photo, type badge, general area, price, CTA
- Add filter UI: property type, price range — client-side filtering on fetched data (no separate API call at this scale)

### 3.2 Property detail page

- Build `app/[locale]/listings/[slug]/page.tsx`
- Apply coordinate offset via `lib/mapOffset.ts` server-side — offset coordinates passed to map component, raw coordinates never in page output
- Build `components/public/PropertyGallery` — photo gallery with lightbox
- Build `components/public/MapPin` — renders Google Maps embed with offset pin (use Google Maps Embed API, no JS SDK needed)
- Build `components/public/InquiryForm` — name, phone, message, submits to `/api/inquiries`
- Build `components/public/WhatsAppButton` — pre-filled message with listing title
- `generateMetadata` for SEO per listing
- JSON-LD structured data block injected into page head

### 3.3 Home page

- Build `app/[locale]/page.tsx`
- Hero section with headline, subheadline, WhatsApp CTA
- Featured listings section — fetches listings where `featured: true`
- Property type shortcut links to listings page with pre-applied filter

### 3.4 About and Contact pages

- Build `app/[locale]/about/page.tsx` — agency description, agent profile
- Build `app/[locale]/contact/page.tsx` — inquiry form, WhatsApp link

### 3.5 Header and Footer

- Build `components/public/Header` — logo, nav links, language switcher (EN / ລາວ / 中文)
- Build `components/public/Footer` — minimal, WhatsApp link, copyright

### 3.6 Inquiries API

- Implement `app/api/inquiries/route.ts` — POST only, public route (no auth required)
- Saves inquiry to DB
- Calls `lib/resend.ts` to send email notification

---

## Phase 4 — CRM

**Goal:** Admin and agents can manage clients and inquiries from the admin panel.

### 4.1 Clients API

- Implement `app/api/clients/route.ts` — GET all, POST new
- Implement `app/api/clients/[id]/route.ts` — GET, PUT, DELETE
- DELETE restricted to admin role

### 4.2 Clients UI

- Build `app/admin/clients/page.tsx` — table with filters: status, interest type, assigned agent
- Build `app/admin/clients/new/page.tsx`
- Build `app/admin/clients/[id]/page.tsx` — full client record, notes, linked listings
- Build `components/admin/ClientForm` — all fields from schema

### 4.3 Inquiry inbox

- Build `app/admin/inquiries/page.tsx` — table sorted by newest first, status filter
- Build `components/admin/InquiryTable`
- "Convert to client" action — pre-populates client form with inquiry data, saves client, marks inquiry as converted

### 4.4 User management

- Build `app/admin/users/page.tsx` — list of users, visible to admin role only
- Create user form: name, email, password, role
- Deactivate user action (sets `active: false`, does not delete)
- Password reset: admin sets a new password directly

---

## Phase 5 — Polish

**Goal:** Production-ready. SEO complete, all three languages populated, mobile tested.

### 5.1 i18n completeness

- Populate all keys in `messages/lo.json` and `messages/zh.json`
- Audit every public UI string — nothing hardcoded in English
- Test language switcher on every public page — URL updates, content switches, no flash

### 5.2 SEO

- Verify `generateMetadata` on all public pages
- Verify JSON-LD on all property detail pages
- Add `robots.txt` and `sitemap.xml` (Next.js built-in)
- Submit sitemap to Google Search Console

### 5.3 Mobile

- Test all public pages on mobile viewport
- Test admin panel on mobile — agents will use this in the field
- Fix any layout breaks

### 5.4 Performance

- Verify all images served via Cloudinary URLs (already optimized)
- Check Core Web Vitals in Vercel dashboard
- Add `loading="lazy"` to below-fold images

### 5.5 Error states

- 404 page per locale
- Form error states — inline validation messages
- Empty states in admin tables — "No listings yet", "No clients yet"

---

## Phase 6 — Launch

**Goal:** Live on the real domain, analytics running, DNS configured.

### 6.1 Vercel deployment

- Connect GitHub repo to Vercel
- Add all environment variables in Vercel dashboard
- Confirm build passes

### 6.2 DNS

- Point domain to Vercel
- Confirm SSL certificate issued
- Test all locale routes on live domain

### 6.3 Cloudinary

- Confirm watermark preset is active on production uploads
- Upload a test photo, verify watermark appears correctly

### 6.4 Umami

- Install Umami (self-hosted on a free tier VPS or use Umami Cloud free tier)
- Add script to `app/[locale]/layout.tsx`
- Confirm events appear in Umami dashboard
- Do not mention analytics to the client

### 6.5 Seed production data

- Create admin account for Maxon
- Create agent account for GF
- Enter all current listings with photos

### 6.6 Google Business Profile

- Create or claim "PM Real Estate Laos" on Google
- Add website URL, WhatsApp number, general service area
- Upload photos (use watermarked versions from Cloudinary)

---

## Build Order Summary

```
Phase 1  →  Bootstrap, DB, Auth, i18n scaffold
Phase 2  →  Cloudinary, Listings admin CRUD
Phase 3  →  Public site, listings, detail pages, home, contact
Phase 4  →  CRM, clients, inquiries, user management
Phase 5  →  i18n complete, SEO, mobile, polish
Phase 6  →  Deploy, DNS, seed data, Google Business Profile
```

---

## Notes

- Do not start Phase 3 before Phase 2 is complete — the public site depends on real listing data to test properly
- Do not start Phase 5 before all features are built — polishing incomplete features wastes time
- Translations for LO and ZH can be done in parallel with Phase 4 — they do not block each other
- Google Business Profile does not require business registration

---

*End of Roadmap v1.0*