# Software Requirements Specification
## PM Real Estate Laos

**Version:** 1.0  
**Date:** 2026-04-03  
**Author:** Maxon Torres

---

## 1. Overview

PM Real Estate Laos is a bilingual property listing and agency management platform for a Vientiane-based real estate operation. The system serves two distinct audiences: public visitors browsing properties, and internal users managing listings, clients, and inquiries.

The platform replaces informal tools (WhatsApp threads, memory, Facebook) with a structured, professional system built to grow alongside the business.

---

## 2. Goals

- Present property listings professionally to expat, foreign investor, and local audiences
- Support EN, LO, and ZH from launch
- Allow internal users to manage listings and client relationships without developer involvement
- Capture and track all inbound inquiries
- Generate no ongoing SaaS cost beyond hosting

---

## 3. Users

### 3.1 Public Users
Foreign expats, Chinese investors, local Lao nationals, and international visitors browsing available properties. They speak English, Lao, or Chinese. They find the site via Google search or direct referral. They do not create accounts.

### 3.2 Internal Users

| Role | Description |
|------|-------------|
| `admin` | Full access. Manages users, listings, clients, inquiries, and settings. |
| `agent` | Can manage listings and clients. Cannot manage users or system settings. |

Internal users authenticate via email and password. No self-registration — accounts are created by the admin.

---

## 4. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, no src/ directory) |
| Styling | CSS Modules |
| Internationalization | next-intl |
| ORM | Prisma |
| Database | PostgreSQL (Neon — free tier, no credit card) |
| Email | Resend |
| Analytics | Umami (silent install) |
| Deployment | Vercel |

---

## 5. Internationalization

The platform supports three languages at launch:

| Code | Language | Audience |
|------|----------|----------|
| `en` | English | Expats, foreign investors |
| `lo` | Lao | Local nationals |
| `zh` | Chinese (Simplified) | Chinese investors |

Locale is embedded in the URL: `/en/...`, `/lo/...`, `/zh/...`

The default locale is `en`. All UI strings, property descriptions, and static content are translated across all three languages. The admin panel is English only.

---

## 6. Public-Facing Features

### 6.1 Home Page
- Hero section with tagline and primary CTA (WhatsApp contact)
- Featured listings (configurable from admin)
- Property type filter shortcuts (Land, House, Rental)
- Brief agency introduction

### 6.2 Listings Page
- Grid of all active listings
- Filter by: property type, price range, general area
- Each card shows: primary photo, type, general area, price, short description
- No exact addresses displayed publicly

### 6.3 Property Detail Page
- Photo gallery (multiple images)
- Property details: type, size, price, general area, key features
- Approximate location on Google Maps (pin offset by ~300–500m from actual location)
- WhatsApp CTA button (links directly to her WhatsApp with pre-filled message referencing the listing)
- Inquiry form (name, phone/WhatsApp number, message) — sends email via Resend

### 6.4 About Page
- Agency description, agent profile, areas of operation

### 6.5 Contact Page
- WhatsApp link
- Inquiry form
- General area of operation (no office address required)

---

## 7. Admin Panel

Accessible at `/admin`. English only. Requires authentication.

### 7.1 Authentication
- Email + password login
- Session-based auth (NextAuth.js or custom JWT)
- No self-registration
- Admin can create, deactivate, and reset passwords for other users

### 7.2 Listings Manager

Each listing contains:

| Field | Type | Notes |
|-------|------|-------|
| ID | UUID | Auto-generated |
| Type | Enum | `land`, `house`, `rental` |
| Status | Enum | `available`, `sold`, `rented`, `hidden` |
| Title | String (EN/LO/ZH) | Translated per language |
| Description | Text (EN/LO/ZH) | Translated per language |
| Price | Decimal | Stored in USD |
| Price unit | Enum | `total`, `per_month` |
| Area (size) | Decimal | In square meters |
| General location | String (EN/LO/ZH) | District or landmark reference |
| Map coordinates | Lat/Lng | Offset applied before display |
| Photos | Array of URLs | Uploaded via admin |
| Featured | Boolean | Shows on home page |
| Created at | Timestamp | Auto |
| Updated at | Timestamp | Auto |

Admin capabilities:
- Create, edit, delete listings
- Upload and reorder photos
- Toggle featured status
- Change listing status (available / sold / rented / hidden)

### 7.3 CRM — Client Manager

Each client record contains:

| Field | Type | Notes |
|-------|------|-------|
| ID | UUID | Auto-generated |
| Full name | String | |
| Phone / WhatsApp | String | |
| Email | String | Optional |
| Language | Enum | `en`, `lo`, `zh`, `other` |
| Interest type | Enum | `land`, `house`, `rental`, `any` |
| Budget (min/max) | Decimal | In USD |
| Notes | Text | Free-form agent notes |
| Status | Enum | `new`, `active`, `closed`, `lost` |
| Source | Enum | `website`, `referral`, `direct`, `other` |
| Assigned agent | Relation | Internal user |
| Last contact date | Date | Manually updated |
| Created at | Timestamp | Auto |

Admin capabilities:
- Create, edit, delete clients
- Add notes to client records
- Filter by status, interest type, assigned agent
- Link a client to one or more listings they have viewed or expressed interest in

### 7.4 Inquiry Inbox

Inquiries submitted via the public contact and property detail forms are stored here.

| Field | Type |
|-------|------|
| Name | String |
| Phone / WhatsApp | String |
| Message | Text |
| Listing reference | Relation (optional) |
| Status | Enum: `new`, `contacted`, `converted`, `closed` |
| Created at | Timestamp |

Admin can:
- View all inquiries
- Mark status
- Convert an inquiry into a client record with one action

---

## 8. Data & Privacy

- No public user accounts
- No publicly exposed addresses or exact coordinates
- Map pins are offset before rendering — exact coordinates never reach the browser
- No third-party tracking beyond Umami (self-hosted, cookieless)
- No Meta integrations

---

## 9. Non-Functional Requirements

| Requirement | Detail |
|-------------|--------|
| Performance | Core Web Vitals green on Vercel Edge |
| SEO | Meta tags, Open Graph, structured data (schema.org/RealEstateListing) per property page |
| Mobile | Fully responsive — agents access admin from phones |
| Accessibility | WCAG AA minimum for public pages |
| Cost | Zero paid infrastructure at launch (Neon free tier, Vercel free tier) |

---

## 10. Out of Scope (v1)

- Korean and Vietnamese languages (added when Umami data justifies it)
- WhatsApp automation or bots
- Payment processing
- Mortgage calculators or valuation tools
- Agent commission tracking
- External MLS or listing syndication
- Mobile app

---

## 11. Open Questions

| # | Question | Owner |
|---|----------|-------|
| 1 | Final domain confirmed? | Maxon |
| 2 | Photo storage — Vercel Blob or Cloudinary free tier? | Maxon |
| 3 | Who handles LO and ZH translations for UI strings? | Maxon + GF |

---

*End of SRS v1.0*