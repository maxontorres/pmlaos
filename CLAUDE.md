# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

Database:
```bash
npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma generate                    # Regenerate Prisma client after schema changes
npx prisma studio                      # Browse the database visually
npx prisma db seed                     # Run prisma/seed.ts
```

## Architecture

### Route structure

Two parallel trees share the same codebase but have entirely different concerns:

- **`app/[locale]/`** — public-facing site. All routes are locale-prefixed (`/en/...`, `/lo/...`, `/zh/...`). Wrapped by `proxy.ts` (next-intl). Locale layout applies Noto Sans Lao font when `locale === 'lo'`.
- **`app/admin/`** — internal panel at `/admin`. English only. Outside locale routing. Protected by a session guard in `app/admin/layout.tsx`.
- **`app/api/`** — API routes. Auth-required except `api/inquiries` (public POST). `DELETE` on listings and clients restricted to `admin` role.

### i18n

`next-intl` handles locale routing via `proxy.ts` (Next.js uses `proxy.ts` instead of `middleware.ts`). Routing is defined in `i18n/routing.ts`. Messages are loaded server-side in `i18n/request.ts`. Navigation helpers (`Link`, `redirect`, `usePathname`, `useRouter`) come from `i18n/navigation.ts` — use these instead of importing directly from `next/navigation`. Translation keys live in `messages/en.json`, `messages/lo.json`, `messages/zh.json`. All public UI strings must come from message keys — nothing hardcoded in components.

### Auth

NextAuth.js with a Credentials provider. Session strategy is JWT. `lib/auth.ts` exports `{ handlers, signIn, signOut, auth }`. The `auth()` call is used server-side to gate admin routes and API routes. Passwords hashed with bcryptjs. No public registration — admin creates accounts manually.

### Database

Prisma + PostgreSQL (Neon). The client singleton is at `lib/prisma.ts`. Full schema is in `SPEC.md §2` and `prisma/schema.prisma`. Key models: `Listing`, `Photo`, `Client`, `ClientListing`, `Inquiry`, `User`.

### Photo uploads

All uploads go through `app/api/upload/route.ts` — the route proxies to Cloudinary server-side so the API secret never reaches the browser. The Cloudinary upload preset `pm_real_estate` applies the watermark transformation automatically on upload.

### Map coordinates

`lib/mapOffset.ts` offsets lat/lng by ±0.004 degrees (~300–500m) before passing coordinates to the map component. Raw coordinates are never serialized into page output — offset is applied in the server component.

### Components

Split into `components/public/` and `components/admin/`. Each component has its own folder with a `.tsx` and a `.module.css` file.

### Styling

CSS Modules only. Design tokens defined in `app/globals.css` under `:root`. Key tokens: `--color-primary` (#0D1B3E navy), `--color-accent` (#C9A227 gold), `--color-bg` (#FAFAF8), `--max-width` (1200px), `--radius` (6px).

### Role-based access

Two roles: `admin` and `agent`. Role is stored in the JWT and checked server-side. Agents cannot delete listings/clients or access user management. See `SPEC.md §11` for the full matrix.

## Current build state

Phase 1 partially complete. Done: root layout, globals.css, locale layout with `NextIntlClientProvider`, home page stub, Navbar, Footer, `next-intl` wired with `proxy.ts`, message files for EN/LO/ZH. Still to do: Prisma + Neon DB, NextAuth, admin login page, admin layout session guard. Not yet installed: `prisma`, `next-auth`, `bcryptjs`, `cloudinary`, `resend`. See `ROADMAP.md` for the full 6-phase plan.
