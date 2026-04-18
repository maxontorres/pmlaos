import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import path from 'path'
import { getListingBySlug, formatPrice } from '@/lib/listingsPublic'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await params

  const logoBuffer = await readFile(path.join(process.cwd(), 'public/img/pmlaos-logo-no-bg.png'))
  const logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`

  const listing = await getListingBySlug(slug)

  if (!listing) {
    return new ImageResponse(
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0f2744', alignItems: 'center', justifyContent: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="PM Real Estate" style={{ height: 80 }} />
      </div>,
      { ...size }
    )
  }

  const photo = listing.photos[0]
  const price = formatPrice(listing.price, listing.priceUnit)

  const facts: string[] = []
  if (listing.bedrooms) facts.push(`${listing.bedrooms} bed`)
  if (listing.bathrooms) facts.push(`${listing.bathrooms} bath`)
  if (listing.areaSqm) facts.push(`${listing.areaSqm} m²`)

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {/* Left panel — branding + listing info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: 500,
            flexShrink: 0,
            backgroundColor: '#0f2744',
            padding: '52px 48px',
          }}
        >
          {/* Logo + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="PM Real Estate" style={{ height: 56, objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>PM Real Estate</span>
              <span style={{ color: '#a8b8cc', fontSize: 16, fontWeight: 400 }}>Vientiane, Laos</span>
            </div>
          </div>

          {/* Listing details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', color: '#ffffff', fontSize: 40, fontWeight: 800, lineHeight: 1.15 }}>
              {listing.titleEn}
            </div>
            <div style={{ display: 'flex', color: '#c9a96e', fontSize: 34, fontWeight: 700 }}>
              {price}
            </div>
            {(listing.villageName || facts.length > 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {listing.villageName && (
                  <div style={{ display: 'flex', color: '#a8b8cc', fontSize: 20 }}>
                    📍 {listing.villageName}
                  </div>
                )}
                {facts.length > 0 && (
                  <div style={{ display: 'flex', color: '#a8b8cc', fontSize: 20 }}>
                    {facts.join('  ·  ')}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', color: '#4a6a8a', fontSize: 16 }}>
            pmlaos.com
          </div>
        </div>

        {/* Right panel — property photo */}
        <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#1a3a5c' }} />
          )}
          {/* Blend seam between panels */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 80,
              height: '100%',
              background: 'linear-gradient(to right, #0f2744, transparent)',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
