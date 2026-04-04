import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import ListingCard from '@/components/public/ListingCard/ListingCard'
import { getFeaturedListings } from '@/lib/dummy'
import styles from './page.module.css'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()
  const featured = getFeaturedListings()

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{t('home.title')}</h1>
          <p className={styles.heroSubtitle}>{t('home.subtitle')}</p>
          <Link href={`/${locale}/listings`} className={styles.heroCta}>
            {t('home.cta')}
          </Link>
        </div>
      </section>

      {/* Featured Listings */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{t('home.featured')}</h2>
            <Link href={`/${locale}/listings`} className={styles.sectionLink}>
              {t('home.browseAll')} →
            </Link>
          </div>
          <div className={styles.grid}>
            {featured.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                locale={locale}
                typeLabel={t(`listing.type${listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}`)}
                areaLabel={t('listing.area')}
                sqmLabel={t('listing.sqm')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('home.typeTitle')}</h2>
          <div className={styles.typeGrid}>
            {(['land', 'house', 'rental'] as const).map((type) => (
              <Link
                key={type}
                href={`/${locale}/listings?type=${type}`}
                className={styles.typeCard}
              >
                <span className={styles.typeIcon}>
                  {type === 'land' ? '🏞' : type === 'house' ? '🏠' : '🏢'}
                </span>
                <h3 className={styles.typeTitle}>
                  {t(`home.type${type.charAt(0).toUpperCase() + type.slice(1)}`)}
                </h3>
                <p className={styles.typeDesc}>
                  {t(`home.type${type.charAt(0).toUpperCase() + type.slice(1)}Desc`)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.container}>
          <p className={styles.ctaBannerText}>{t('home.ctaBanner')}</p>
          <Link href={`/${locale}/contact`} className={styles.ctaBannerBtn}>
            {t('home.ctaContact')}
          </Link>
        </div>
      </section>
    </>
  )
}
