import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import ListingCard from '@/components/public/ListingCard/ListingCard'
import { getFeaturedListings } from '@/lib/dummy'
import styles from './page.module.css'

type HomePageProps = {
  params: Promise<{ locale: string }>
}

type PromoContent = {
  image: string
  href: string
}

function getListingTypeLabel(
  t: Awaited<ReturnType<typeof getTranslations>>,
  listing: (ReturnType<typeof getFeaturedListings>)[number],
) {
  const categoryKey = `listing.category${listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}` as
    | 'listing.categoryLand'
    | 'listing.categoryHouse'
    | 'listing.categoryApartment'
  const transactionKey =
    `listing.transaction${listing.transaction.charAt(0).toUpperCase() + listing.transaction.slice(1)}` as
      | 'listing.transactionSale'
      | 'listing.transactionRent'

  const categoryLabel = t(categoryKey)
  const transactionLabel = t(transactionKey)

  return listing.category === 'land'
    ? categoryLabel
    : `${categoryLabel} · ${transactionLabel}`
}

function getPromoContent(locale: string): PromoContent {
  return {
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
    href: `/${locale}/listings/modern-villa-chanthabouly`,
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations()
  const featured = getFeaturedListings()
  const heroListing = featured[0]
  const promo = getPromoContent(locale)

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.heroGlow} />
        <div className={`${styles.container} ${styles.heroShell}`}>
          <div className={styles.heroCopy}>
            <p className={styles.heroKicker}>{t('home.kicker')}</p>
            <h1 className={styles.heroTitle}>{t('home.title')}</h1>
            <p className={styles.heroSubtitle}>{t('home.subtitle')}</p>

            <div className={styles.heroActions}>
              <Link href={`/${locale}/listings`} className={styles.heroCtaPrimary}>
                {t('home.cta')}
              </Link>
              <Link href={`/${locale}/contact`} className={styles.heroCtaSecondary}>
                {t('home.ctaContact')}
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{t('home.stat1Num')}</span>
                <span className={styles.heroStatLabel}>{t('home.stat1Label')}</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{t('home.stat2Num')}</span>
                <span className={styles.heroStatLabel}>{t('home.stat2Label')}</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{t('home.stat3Num')}</span>
                <span className={styles.heroStatLabel}>{t('home.stat3Label')}</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div
              className={styles.heroFrame}
              style={{ backgroundImage: `linear-gradient(180deg, rgba(8, 17, 41, 0.08), rgba(8, 17, 41, 0.7)), url(${promo.image})` }}
            >
              <div className={styles.heroFrameTop}>
                <span className={styles.heroFrameBadge}>{t('home.heroSpotlight')}</span>
                <span className={styles.heroFrameLocation}>{t('home.heroLocation')}</span>
              </div>

              {heroListing && (
                <div className={styles.heroPropertyCard}>
                  <p className={styles.heroPropertyType}>
                    {getListingTypeLabel(t, heroListing)}
                  </p>
                  <h2 className={styles.heroPropertyTitle}>{heroListing.titleEn}</h2>
                  <p className={styles.heroPropertyMeta}>{heroListing.locationEn}</p>
                  <Link
                    href={`/${locale}/listings/${heroListing.slug}`}
                    className={styles.heroPropertyLink}
                  >
                    {t('home.heroExplore')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.storyBand}>
        <div className={`${styles.container} ${styles.storyGrid}`}>
          <div className={styles.storyIntro}>
            <p className={styles.storyEyebrow}>{t('home.storyEyebrow')}</p>
            <h2 className={styles.storyTitle}>{t('home.storyTitle')}</h2>
            <p className={styles.storyText}>{t('home.storyBody')}</p>
          </div>
          <div className={styles.storyPanel}>
            <span className={styles.storyPanelLabel}>{t('home.storyPanelLabel')}</span>
            <p className={styles.storyPanelQuote}>{t('home.storyPanelQuote')}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sponsoredBanner}>
            <div
              className={styles.sponsoredMedia}
              style={{ backgroundImage: `linear-gradient(135deg, rgba(8, 17, 41, 0.2), rgba(8, 17, 41, 0.78)), url(${promo.image})` }}
            />
            <div className={styles.sponsoredContent}>
              <span className={styles.sponsoredBadge}>{t('home.promoEyebrow')}</span>
              <h2 className={styles.sponsoredTitle}>{t('home.promoTitle')}</h2>
              <p className={styles.sponsoredText}>{t('home.promoBody')}</p>
              <div className={styles.sponsoredMetaRow}>
                <span>{t('home.promoMeta1')}</span>
                <span>{t('home.promoMeta2')}</span>
                <span>{t('home.promoMeta3')}</span>
              </div>
              <Link href={promo.href} className={styles.sponsoredCta}>
                {t('home.promoCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionEyebrow}>{t('home.featuredEyebrow')}</p>
              <h2 className={styles.sectionTitle}>{t('home.featured')}</h2>
            </div>
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
                typeLabel={getListingTypeLabel(t, listing)}
                areaLabel={t('listing.area')}
                sqmLabel={t('listing.sqm')}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionEyebrow}>{t('home.typeEyebrow')}</p>
              <h2 className={styles.sectionTitle}>{t('home.typeTitle')}</h2>
            </div>
          </div>
          <div className={styles.typeGrid}>
            <Link
              href={`/${locale}/listings?category=land&transaction=sale`}
              className={styles.typeCard}
            >
              <span className={styles.typeIconWrap}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 20 L8 10 L12 15 L16 8 L21 20 Z" />
                </svg>
              </span>
              <h3 className={styles.typeTitle}>{t('home.typeLand')}</h3>
              <p className={styles.typeDesc}>{t('home.typeLandDesc')}</p>
            </Link>
            <Link
              href={`/${locale}/listings?category=house&transaction=sale`}
              className={styles.typeCard}
            >
              <span className={styles.typeIconWrap}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12 L12 4 L21 12" />
                  <path d="M5 10 L5 20 L19 20 L19 10" />
                  <rect x="9" y="14" width="6" height="6" />
                </svg>
              </span>
              <h3 className={styles.typeTitle}>{t('home.typeHouse')}</h3>
              <p className={styles.typeDesc}>{t('home.typeHouseDesc')}</p>
            </Link>
            <Link
              href={`/${locale}/listings?category=apartment&transaction=rent`}
              className={styles.typeCard}
            >
              <span className={styles.typeIconWrap}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="1" />
                  <path d="M3 9 L21 9" />
                  <path d="M9 3 L9 9" />
                  <path d="M15 3 L15 9" />
                  <path d="M7 14 L10 14" />
                  <path d="M14 14 L17 14" />
                  <path d="M7 18 L10 18" />
                  <path d="M14 18 L17 18" />
                </svg>
              </span>
              <h3 className={styles.typeTitle}>{t('home.typeRental')}</h3>
              <p className={styles.typeDesc}>{t('home.typeRentalDesc')}</p>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.ctaBanner}>
        <div className={`${styles.container} ${styles.ctaShell}`}>
          <div>
            <p className={styles.sectionEyebrow}>{t('home.ctaEyebrow')}</p>
            <p className={styles.ctaBannerText}>{t('home.ctaBanner')}</p>
          </div>
          <Link href={`/${locale}/contact`} className={styles.ctaBannerBtn}>
            {t('home.ctaContact')}
          </Link>
        </div>
      </section>
    </>
  )
}
