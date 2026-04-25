import Image from 'next/image'
import Link from 'next/link'
import { type PublicListing, formatPrice } from '@/lib/listingsPublic'
import styles from './ListingCard.module.css'

interface Props {
  listing: PublicListing
  locale: string
  typeLabel: string
  areaLabel: string
  sqmLabel: string
}

export default function ListingCard({ listing, locale, typeLabel, areaLabel, sqmLabel }: Props) {
  const { slug, titleEn, villageName, price, priceUnit, photos, category, transaction } = listing
  const photo = photos[0]
  const areaSqm = listing.areaSqm

  const badgeClass =
    category === 'land' ? styles.badge_land
    : category === 'hotel' ? styles.badge_hotel
    : transaction === 'rent' ? styles.badge_rent
    : styles.badge_sale

  return (
    <Link href={`/${locale}/listings/${slug}`} className={styles.card}>
      <div className={styles.photoWrap}>
        <Image
          src={photo}
          alt={titleEn}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
        <div className={styles.photoOverlay} />
        <span className={`${styles.badge} ${badgeClass}`}>{typeLabel}</span>
      </div>
      <div className={styles.body}>
        <p className={styles.location}>{villageName}</p>
        <h3 className={styles.title}>{titleEn}</h3>
        <div className={styles.meta}>
          <span className={styles.price}>{formatPrice(price, priceUnit)}</span>
          {areaSqm && (
            <span className={styles.area} aria-label={areaLabel}>
              {areaSqm} {sqmLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
