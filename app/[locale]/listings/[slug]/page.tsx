import { getTranslations, setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import WhatsAppButton from '@/components/public/WhatsAppButton/WhatsAppButton'
import { listings, getListingBySlug, formatPrice } from '@/lib/dummy'
import styles from './page.module.css'

export function generateStaticParams() {
  return listings.map((l) => ({ slug: l.slug }))
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  const listing = getListingBySlug(slug)
  if (!listing) notFound()

  const typeKey = `listing.type${listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}` as
    | 'listing.typeLand'
    | 'listing.typeHouse'
    | 'listing.typeRental'
  const typeLabel = t(typeKey)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Back link */}
        <Link href={`/${locale}/listings`} className={styles.back}>
          {t('listing.backToListings')}
        </Link>

        {/* Photo gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainPhoto}>
            <Image
              src={listing.photos[0]}
              alt={listing.titleEn}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          {listing.photos.length > 1 && (
            <div className={styles.thumbRow}>
              {listing.photos.slice(1).map((src, i) => (
                <div key={i} className={styles.thumb}>
                  <Image
                    src={src}
                    alt={`${listing.titleEn} photo ${i + 2}`}
                    fill
                    sizes="200px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className={styles.layout}>
          {/* Main content */}
          <div className={styles.main}>
            {/* Info card */}
            <div className={styles.infoCard}>
              <span className={`${styles.badge} ${styles[`badge_${listing.type}`]}`}>
                {typeLabel}
              </span>
              <h1 className={styles.title}>{listing.titleEn}</h1>
              <p className={styles.price}>{formatPrice(listing.price, listing.priceUnit)}</p>
              <dl className={styles.details}>
                <div className={styles.detailRow}>
                  <dt>{t('listing.location')}</dt>
                  <dd>{listing.locationEn}</dd>
                </div>
                {listing.areaSqm && (
                  <div className={styles.detailRow}>
                    <dt>{t('listing.area')}</dt>
                    <dd>
                      {listing.areaSqm} {t('listing.sqm')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Description */}
            <div className={styles.descSection}>
              <h2 className={styles.sectionTitle}>{t('listing.description')}</h2>
              <p className={styles.desc}>{listing.descriptionEn}</p>
            </div>

            {/* Map placeholder */}
            <div className={styles.mapSection}>
              <div className={styles.mapPlaceholder}>
                <span>{t('listing.mapPlaceholder')}</span>
              </div>
              <p className={styles.mapNote}>{t('listing.approxLocation')}</p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <h2 className={styles.sideTitle}>{t('listing.inquire')}</h2>
              <WhatsAppButton
                label={t('listing.whatsapp')}
                listingTitle={listing.titleEn}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
