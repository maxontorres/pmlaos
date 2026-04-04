import { getTranslations, setRequestLocale } from 'next-intl/server'
import ListingCard from '@/components/public/ListingCard/ListingCard'
import { listings, PropertyType } from '@/lib/dummy'
import styles from './page.module.css'

const VALID_TYPES: PropertyType[] = ['land', 'house', 'rental']

export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { locale } = await params
  const { type: rawType } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations()

  const activeType = VALID_TYPES.includes(rawType as PropertyType)
    ? (rawType as PropertyType)
    : null

  const filtered = activeType
    ? listings.filter((l) => l.type === activeType && l.status === 'available')
    : listings.filter((l) => l.status === 'available')

  const filters = [
    { key: null,       label: t('listings.filterAll') },
    { key: 'land',     label: t('listings.filterLand') },
    { key: 'house',    label: t('listings.filterHouse') },
    { key: 'rental',   label: t('listings.filterRental') },
  ] as const

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('listings.pageTitle')}</h1>

        {/* Filter tabs */}
        <div className={styles.filters}>
          {filters.map(({ key, label }) => {
            const href = key ? `/${locale}/listings?type=${key}` : `/${locale}/listings`
            const active = key === activeType
            return (
              <a
                key={String(key)}
                href={href}
                className={`${styles.filter} ${active ? styles.filterActive : ''}`}
              >
                {label}
              </a>
            )
          })}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((listing) => (
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
        ) : (
          <p className={styles.empty}>{t('listings.noResults')}</p>
        )}
      </div>
    </div>
  )
}
