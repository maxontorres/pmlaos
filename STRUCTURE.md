# Project Directory Structure
## PM Real Estate Laos

```
pm-real-estate/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        # Home
│   │   ├── listings/
│   │   │   ├── page.tsx                    # All listings
│   │   │   └── [slug]/
│   │   │       └── page.tsx                # Property detail
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx                      # Auth guard
│   │   ├── page.tsx                        # Dashboard overview
│   │   ├── listings/
│   │   │   ├── page.tsx                    # Listings table
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx                # Edit listing
│   │   ├── clients/
│   │   │   ├── page.tsx                    # CRM table
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx                # Edit client
│   │   ├── inquiries/
│   │   │   └── page.tsx                    # Inquiry inbox
│   │   └── users/
│   │       └── page.tsx                    # User management (admin only)
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       ├── listings/
│       │   ├── route.ts                    # GET all, POST new
│       │   └── [id]/
│       │       └── route.ts                # GET, PUT, DELETE
│       ├── clients/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── inquiries/
│       │   └── route.ts                    # POST from public form
│       └── upload/
│           └── route.ts                    # Cloudinary upload handler
├── components/
│   ├── public/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── Header.module.css
│   │   ├── Footer/
│   │   │   ├── Footer.tsx
│   │   │   └── Footer.module.css
│   │   ├── ListingCard/
│   │   │   ├── ListingCard.tsx
│   │   │   └── ListingCard.module.css
│   │   ├── ListingGrid/
│   │   │   ├── ListingGrid.tsx
│   │   │   └── ListingGrid.module.css
│   │   ├── PropertyGallery/
│   │   │   ├── PropertyGallery.tsx
│   │   │   └── PropertyGallery.module.css
│   │   ├── MapPin/
│   │   │   ├── MapPin.tsx                  # Offset map display
│   │   │   └── MapPin.module.css
│   │   ├── InquiryForm/
│   │   │   ├── InquiryForm.tsx
│   │   │   └── InquiryForm.module.css
│   │   └── WhatsAppButton/
│   │       ├── WhatsAppButton.tsx
│   │       └── WhatsAppButton.module.css
│   └── admin/
│       ├── AdminLayout/
│       │   ├── AdminLayout.tsx
│       │   └── AdminLayout.module.css
│       ├── Sidebar/
│       │   ├── Sidebar.tsx
│       │   └── Sidebar.module.css
│       ├── ListingForm/
│       │   ├── ListingForm.tsx
│       │   └── ListingForm.module.css
│       ├── PhotoUploader/
│       │   ├── PhotoUploader.tsx           # Cloudinary upload + preview
│       │   └── PhotoUploader.module.css
│       ├── ClientForm/
│       │   ├── ClientForm.tsx
│       │   └── ClientForm.module.css
│       ├── InquiryTable/
│       │   ├── InquiryTable.tsx
│       │   └── InquiryTable.module.css
│       └── DataTable/
│           ├── DataTable.tsx               # Reusable table component
│           └── DataTable.module.css
├── lib/
│   ├── prisma.ts                           # Prisma client singleton
│   ├── auth.ts                             # NextAuth config
│   ├── cloudinary.ts                       # Cloudinary client + upload helper
│   ├── resend.ts                           # Resend client + email templates
│   ├── mapOffset.ts                        # Coordinate offset logic
│   └── utils.ts                            # Shared utilities
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── messages/
│   ├── en.json
│   ├── lo.json
│   └── zh.json
├── public/
│   ├── logo/
│   │   ├── logo.svg
│   │   └── watermark.png                   # Uploaded to Cloudinary preset
│   └── og/
│       └── og-default.jpg                  # Open Graph fallback image
├── types/
│   └── index.ts                            # Shared TypeScript types
├── middleware.ts                            # next-intl locale routing
├── i18n.ts                                 # next-intl config
├── next.config.ts
├── .env.local
└── package.json
```

---

## Key Decisions

**No src/ directory.** Flat structure per preference.

**Locale in URL.** `/en/listings`, `/lo/listings`, `/zh/listings`. Admin panel at `/admin` is outside locale routing — English only.

**Admin is not locale-scoped.** Lives outside `[locale]` — no i18n overhead in the admin panel.

**Components split by public/admin.** Keeps concerns clean as both sides grow independently.

**mapOffset.ts is isolated.** Coordinate offset logic lives in one place, easy to adjust the offset radius without touching components.

**Cloudinary upload handled server-side.** The `/api/upload` route signs and proxies the upload — the Cloudinary API secret never reaches the browser.
```