import Image from 'next/image'
import Link from 'next/link'
import { Listing, formatPrice } from '@/lib/dummy'
import styles from './ListingCard.module.css'

interface Props {
  listing: Listing
  locale: string
  typeLabel: string
  areaLabel: string
  sqmLabel: string
}

export default function ListingCard({ listing, locale, typeLabel, areaLabel, sqmLabel }: Props) {
  const { slug, titleEn, locationEn, price, priceUnit, areaSqm, photos, type } = listing
  const photo = photos[0]

  return (
    <Link href={`/${locale}/listings/${slug}`} className={styles.card}>
      <div className={styles.photoWrap}>
        <Image
          src={photo}
          alt={titleEn}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
        <span className={`${styles.badge} ${styles[`badge_${type}`]}`}>{typeLabel}</span>
      </div>
      <div className={styles.body}>
        <p className={styles.location}>{locationEn}</p>
        <h3 className={styles.title}>{titleEn}</h3>
        <div className={styles.meta}>
          <span className={styles.price}>{formatPrice(price, priceUnit)}</span>
          {areaSqm && (
            <span className={styles.area}>
              {areaSqm} {sqmLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
