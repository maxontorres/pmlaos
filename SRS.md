# Software Requirements Specification (SRS)
## PM Real Estate — ອະສັງຫາລິມະຊັບ
**Version:** 1.0  
**Date:** 2025  
**Location:** Vientiane, Laos  
**Stack:** Next.js 14 · PostgreSQL · Prisma · Cloudinary · Vercel

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Objectives](#2-objectives)
3. [Stakeholders](#3-stakeholders)
4. [Functional Requirements](#4-functional-requirements)
   - 4.1 [Public Site](#41-public-site)
   - 4.2 [Admin Panel](#42-admin-panel)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [i18n Requirements](#6-i18n-requirements)
7. [Data Requirements](#7-data-requirements)
8. [External Integrations](#8-external-integrations)
9. [Out of Scope (v1)](#9-out-of-scope-v1)
10. [Assumptions & Constraints](#10-assumptions--constraints)

---

## 1. Project Overview

PM Real Estate is a property listing and lead-generation website for a real estate agency based in Vientiane, Laos. The agency acts as a **broker** — it does not own the properties it lists.

The website replaces the current Facebook-only presence with a dedicated platform that provides searchable property listings and a direct channel for potential buyers/renters to contact the agency.

The site must serve **two audiences**:
- Lao-speaking locals (primary audience — default locale)
- English-speaking expats and foreign investors

Locale is determined by the URL prefix: `/lo/...` and `/en/...`.

---

## 2. Objectives

- Allow users to browse, search, and filter property listings (houses for rent, apartments for rent, houses for sale, land for sale)
- Generate qualified leads by connecting prospects with agents via inquiry forms and WhatsApp
- Support Lao (`lo`) and English (`en`) — switchable via URL, no page reload required
- Provide a simple admin panel for PM staff to manage listings without developer involvement
- Achieve strong SEO for Vientiane real estate keywords in both languages
- Be fast and usable on low-end Android devices over a 4G connection

---

## 3. Stakeholders

| Role | Description | System Access |
|------|-------------|---------------|
| PM Real Estate Staff | Add, edit, and remove listings; view and respond to inquiries | Admin panel (`/admin`) |
| Property Seekers (Public) | Browse listings, filter by criteria, submit inquiries | Public site |
| Property Owners | List their properties through PM Real Estate offline | None (no system access) |
| Developer | Build and maintain the platform | Full codebase + DB |

---

## 4. Functional Requirements

### 4.1 Public Site

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-01 | Homepage with hero banner, featured listings section, and contact CTA | High | Featured listings = `featured: true` in DB |
| FR-02 | Listing index page with filter bar | High | Filters: type, price range, bedrooms, district |
| FR-03 | Listing detail page | High | Photos, description, specs, district name, inquiry form. **No map or exact address shown publicly.** |
| FR-04 | Inquiry / contact form on each listing | High | Fields: name, phone, message |
| FR-05 | WhatsApp click-to-contact button on listing detail | High | `wa.me` link pre-filled with listing title |
| FR-06 | Phone number click-to-call button on listing detail | High | `tel:` link |
| FR-07 | About Us page | Medium | Agency story, values, team photo |
| FR-08 | Contact page | Medium | Office address, phone, WhatsApp, Facebook, embedded map of **PM office only** |
| FR-09 | Language switcher in navbar (EN / LO) | High | Swaps locale segment in current URL — preserves page |
| FR-10 | Mobile-responsive layout | High | Primary audience is on mobile |
| FR-11 | SEO meta tags per listing | High | Locale-aware title, description, OG image |
| FR-12 | Facebook page link in footer | Medium | External link to existing Facebook page |
| FR-13 | Pagination on listing index | Medium | 12 listings per page |
| FR-14 | "No results" empty state on listing index | Low | With suggestion to contact agent |

#### 4.1.1 Listing Filter Criteria

The filter bar on the listing index page must support filtering by:

- **Listing type:** Rent — House, Rent — Apartment, Sale — House, Sale — Land
- **District:** All Vientiane districts (Chanthabouly, Sikhottabong, Xaysetha, Sisattanak, Naxaithong, Xaytany, Hadxaifong, Sangthong, Mayparkngum)
- **Price range:** Min / max in either LAK or USD
- **Bedrooms:** 1, 2, 3, 4+
- **Area (sqm):** Optional range filter

All filters must update the URL query string so the filtered view is shareable/bookmarkable.

#### 4.1.2 Listing Detail Page Sections

1. Photo gallery — swipeable on mobile, supports up to 20 images
2. Title (locale-aware) + listing type badge + status badge
3. Key specs: price, bedrooms, bathrooms, area (sqm), district name only
4. Full description (locale-aware)
5. **No map pin, no exact address, no street name** — district name is the most specific location shown publicly
6. Inquiry form (FR-04)
7. WhatsApp + phone buttons (FR-05, FR-06)

---

### 4.2 Admin Panel

The admin panel is accessible at `/admin` and is **not** locale-prefixed. It is intended for internal PM Real Estate staff only.

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-15 | Login page at `/admin/login` | High | Email + password authentication |
| FR-16 | Session-protected admin routes | High | Redirect to login if session is absent |
| FR-17 | Dashboard with summary stats | Medium | Active listings count, unread inquiries count |
| FR-18 | Listing index table | High | All listings with status badge, Edit and Delete actions |
| FR-19 | Create listing form | High | All fields — see Data Requirements |
| FR-20 | Edit listing form | High | Pre-populated with existing data |
| FR-21 | Delete listing | High | Confirm dialog required before deletion |
| FR-22 | Set listing status | High | Active, Rented/Sold, Draft |
| FR-23 | Multi-image upload per listing | High | Upload to Cloudinary; reorder and remove images |
| FR-24 | Inquiries list | High | All submissions grouped by listing |
| FR-25 | Mark inquiry as read | Medium | Visual indicator for unread inquiries |
| FR-26 | Logout | High | Destroys session cookie |
| FR-27 | Client list page | High | Table of all clients with name, phone, number of linked listings |
| FR-28 | Create client | High | Fields: name, phone, notes — manually added by PM staff only |
| FR-29 | Edit / delete client | High | Update contact info or notes; confirm dialog for delete |
| FR-30 | Link client to listings | High | Assign one or more listings to a client via dropdown |
| FR-31 | Deal status per client–listing | High | Status per link: `INTERESTED`, `NEGOTIATING`, `CLOSED` — updatable inline on client detail page |
| FR-32 | Coordinate picker on listing form | High | Small embedded Google Map on create/edit form — admin clicks to set `lat`/`lng` instead of typing raw numbers |
| FR-33 | Map preview on listing edit page | Medium | Once `lat`/`lng` are set, display a small read-only map pin preview so staff can confirm the location is correct |
| FR-34 | Search and filter in admin listings table | High | Filter by type, status, district; keyword search by title — essential for navigating 100+ listings |

---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Listing detail pages must load in under 2 seconds on a 4G mobile connection. Cloudinary handles image resizing and compression automatically. |
| **SEO** | All public listing pages must be statically generated at build time (`generateStaticParams`). The site must expose a `sitemap.xml` covering all active listings in both locales. |
| **Scalability** | The system must support up to 500 active listings comfortably within the Supabase and Vercel free tiers. |
| **Security** | The `/admin` route must be inaccessible without a valid session. Admin credentials must never be hardcoded — stored as environment variables only. Passwords stored as bcrypt hashes. |
| **Availability** | Deployed on Vercel; target 99.9% uptime. |
| **Browser Support** | Latest 2 versions of Chrome, Firefox, Safari (desktop and mobile). |
| **Accessibility** | WCAG 2.1 AA basics: meaningful alt text on all images, keyboard navigability, sufficient color contrast ratio (4.5:1 minimum). |

---

## 6. i18n Requirements

| ID | Requirement |
|----|-------------|
| I18N-01 | Supported locales: `lo` (Lao, default) and `en` (English) |
| I18N-02 | URL structure: `/{locale}/path` — e.g. `/lo/listings/slug` and `/en/listings/slug` |
| I18N-03 | Root path `/` redirects to `/lo` via `middleware.ts` |
| I18N-04 | All UI strings (nav, buttons, labels, errors, CTAs) must be externalized into `messages/lo.json` and `messages/en.json` |
| I18N-05 | Listing title and description are stored bilingual in the database (`titleEn`, `titleLo`, `descEn`, `descLo`) |
| I18N-06 | Language switcher in the navbar swaps only the locale segment of the current URL — the user stays on the same page |
| I18N-07 | Lao script uses **Noto Sans Lao** font (Google Fonts), applied via a CSS class on the `<html>` element when locale is `lo` |
| I18N-08 | `<html lang="">` attribute must reflect the active locale on every page |
| I18N-09 | Locale-aware `generateMetadata()` on listing pages — title and description in the correct language |

---

## 7. Data Requirements

### 7.1 Listing

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | Integer | Auto | Primary key |
| `slug` | String | Yes | Unique; auto-generated from English title |
| `type` | Enum | Yes | `RENT_HOUSE`, `RENT_APT`, `SALE_HOUSE`, `SALE_LAND` |
| `status` | Enum | Yes | `ACTIVE`, `RENTED_SOLD`, `DRAFT` — default `ACTIVE` |
| `titleEn` | String | Yes | English title |
| `titleLo` | String | Yes | Lao title |
| `descEn` | Text | Yes | English description |
| `descLo` | Text | Yes | Lao description |
| `priceKip` | BigInt | No | Price in Lao Kip |
| `priceUsd` | Float | No | Price in USD |
| `bedrooms` | Integer | No | Not applicable for land |
| `bathrooms` | Integer | No | Not applicable for land |
| `areaSqm` | Float | No | Total area in square metres |
| `district` | String | Yes | Vientiane district name — shown publicly |
| `address` | String | No | Exact street address — **stored in DB, never exposed on public site** |
| `lat` | Float | No | Latitude — **stored in DB, never exposed on public site** |
| `lng` | Float | No | Longitude — **stored in DB, never exposed on public site** |
| `images` | String[] | Yes | Array of Cloudinary URLs; minimum 1 |
| `featured` | Boolean | Yes | Default `false` — shown on homepage if `true` |
| `createdAt` | DateTime | Auto | |
| `updatedAt` | DateTime | Auto | |

### 7.2 Inquiry

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | Integer | Auto | Primary key |
| `listingId` | Integer | Yes | FK → Listing |
| `name` | String | Yes | Submitter's name |
| `phone` | String | Yes | Phone number |
| `message` | Text | Yes | Inquiry message |
| `read` | Boolean | Yes | Default `false` |
| `createdAt` | DateTime | Auto | |

### 7.3 Client

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | Integer | Auto | Primary key |
| `name` | String | Yes | Client full name |
| `phone` | String | Yes | Contact phone number |
| `notes` | Text | No | Internal notes by PM staff |
| `createdAt` | DateTime | Auto | |
| `updatedAt` | DateTime | Auto | |

### 7.4 ClientListing _(join table)_

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | Integer | Auto | Primary key |
| `clientId` | Integer | Yes | FK → Client |
| `listingId` | Integer | Yes | FK → Listing |
| `status` | Enum | Yes | `INTERESTED`, `NEGOTIATING`, `CLOSED` — default `INTERESTED` |
| `createdAt` | DateTime | Auto | |
| `updatedAt` | DateTime | Auto | |

---

## 8. External Integrations

| Service | Purpose | Tier |
|---------|---------|------|
| **Supabase** | Hosted PostgreSQL database | Free |
| **Cloudinary** | Image hosting, resizing, and optimization | Free (25 credits/month) |
| **Vercel** | Hosting and CI/CD | Free |
| **Google Maps Embed API** | (1) Office location on public Contact page (2) Coordinate picker and pin preview in admin listing form | Free (embed API has no billing) |
| **WhatsApp** | Click-to-contact via `wa.me` deep link | Free |
| **Resend** _(optional)_ | Email notification to PM staff on new inquiry | Free (50 emails/day) |

---

## 9. Out of Scope (v1)

The following features are explicitly excluded from v1 to keep scope manageable. They are candidates for v2.

- User accounts or registration for property seekers
- Online payments or booking deposits
- Map-based boundary / radius search
- Mortgage or affordability calculator
- Blog or news section
- Multiple admin accounts or role-based access
- Property comparison feature
- Push / SMS notifications
- Native mobile app
- Admin map view showing all listings as pins with type filters (v2 — table + search covers v1 navigation needs)

---

## 10. Assumptions & Constraints

- The agency has **one admin user** — no multi-user or role system is needed for v1.
- All properties are located within **Vientiane** — no other cities in v1.
- The website domain is `PMLaos.com`.
- **Property location privacy:** Exact addresses, coordinates, and map pins are never shown on the public site. Only the district name is visible. This protects the broker relationship between PM Real Estate and property owners.
- PM staff will enter listing content in both Lao and English. No automatic translation.
- Property photos will be supplied by PM staff at listing creation time.
- No existing database to migrate from — the Facebook page is the current system.
- Developer is responsible for the initial seed of real listings from the Facebook page at launch.