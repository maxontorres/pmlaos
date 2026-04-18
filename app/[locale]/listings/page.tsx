import { getTranslations, setRequestLocale } from 'next-intl/server'
import ListingsMapPanel from '@/components/public/ListingsMap/ListingsMapPanel'
import ListingCard from '@/components/public/ListingCard/ListingCard'
import RangeSlider from '@/components/public/RangeSlider/RangeSlider'
import { getPublicListings, getListingsCount, type PropertyCategory, type TransactionType } from '@/lib/listingsPublic'
import Pagination from '@/components/public/Pagination/Pagination'
import { offsetCoordinates } from '@/lib/mapOffset'
import { prisma } from '@/lib/prisma'
import FiltersPanel from '@/components/public/FiltersPanel/FiltersPanel'
import AutoSubmitForm from '@/components/public/AutoSubmitForm/AutoSubmitForm'
import styles from './page.module.css'

type AdvancedFilters = {
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  minBedrooms?: number
  amenities?: string[]
}

const PAGE_SIZE = 12

type ListingsHrefOptions = {
  transaction?: TransactionType
  category?: PropertyCategory
  query?: string
  areaSlug?: string
  selected?: string
  page?: number
} & AdvancedFilters

function buildListingsHref(
  locale: string,
  { transaction, category, query, areaSlug, selected, minPrice, maxPrice, minArea, maxArea, minBedrooms, amenities, page }: ListingsHrefOptions = {},
): string {
  const params = new URLSearchParams()
  if (transaction) params.set('transaction', transaction)
  if (category) params.set('category', category)
  if (query) params.set('q', query)
  if (areaSlug) params.set('areaSlug', areaSlug)
  if (selected) params.set('selected', selected)
  if (minPrice != null) params.set('minPrice', String(minPrice))
  if (maxPrice != null) params.set('maxPrice', String(maxPrice))
  if (minArea != null) params.set('minArea', String(minArea))
  if (maxArea != null) params.set('maxArea', String(maxArea))
  if (minBedrooms != null) params.set('minBedrooms', String(minBedrooms))
  if (amenities?.length) {
    for (const a of amenities) params.append('amenities', a)
  }
  if (page != null && page > 1) params.set('page', String(page))
  const queryString = params.toString()
  return queryString ? `/${locale}/listings?${queryString}` : `/${locale}/listings`
}

export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    category?: string
    transaction?: string
    q?: string
    areaSlug?: string
    selected?: string
    minPrice?: string
    maxPrice?: string
    minArea?: string
    maxArea?: string
    minBedrooms?: string
    amenities?: string | string[]
    page?: string
  }>
}) {
  const { locale } = await params
  const {
    category: rawCategory,
    transaction: rawTx,
    q: rawQuery,
    areaSlug: rawAreaSlug,
    selected: rawSelected,
    minPrice: rawMinPrice,
    maxPrice: rawMaxPrice,
    minArea: rawMinArea,
    maxArea: rawMaxArea,
    minBedrooms: rawMinBedrooms,
    amenities: rawAmenities,
    page: rawPage,
  } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations()

  const validCategories: PropertyCategory[] = ['house', 'apartment', 'land']
  const validTransactions: TransactionType[] = ['sale', 'rent']
  const areas = await prisma.village.findMany({ where: { active: true }, orderBy: { order: 'asc' } })
  const validAreaSlugs = areas.map(a => a.slug)

  const category = validCategories.includes(rawCategory as PropertyCategory)
    ? (rawCategory as PropertyCategory)
    : undefined
  const transaction = validTransactions.includes(rawTx as TransactionType)
    ? (rawTx as TransactionType)
    : undefined
  const areaSlug = validAreaSlugs.includes(rawAreaSlug as string)
    ? (rawAreaSlug as string)
    : undefined
  const query = rawQuery?.trim() || undefined

  const minPrice = rawMinPrice ? (Number(rawMinPrice) || undefined) : undefined
  const maxPrice = rawMaxPrice ? (Number(rawMaxPrice) || undefined) : undefined
  const minArea = rawMinArea ? (Number(rawMinArea) || undefined) : undefined
  const maxArea = rawMaxArea ? (Number(rawMaxArea) || undefined) : undefined
  const minBedrooms = rawMinBedrooms ? (Number(rawMinBedrooms) || undefined) : undefined
  const amenities: string[] | undefined = rawAmenities == null
    ? undefined
    : (Array.isArray(rawAmenities) ? rawAmenities.filter(Boolean) : [rawAmenities]) || undefined

  const page = Math.max(1, Number(rawPage) || 1)

  const adv: AdvancedFilters = { minPrice, maxPrice, minArea, maxArea, minBedrooms, amenities }
  const hasAdvancedFilters = minPrice != null || maxPrice != null || minArea != null || maxArea != null || minBedrooms != null || amenities?.length
  const activeFilterCount = [
    minPrice != null || maxPrice != null,
    minArea != null || maxArea != null,
    minBedrooms != null,
    (amenities?.length ?? 0) > 0,
  ].filter(Boolean).length

  // Compute slider bounds from listings matching the active transaction (if set)
  const [boundsPool, totalCount, filtered, baseResults] = await Promise.all([
    getPublicListings({ transaction }),
    getListingsCount({ category, transaction, areaSlug, query, minPrice, maxPrice, minArea, maxArea, minBedrooms, amenities }),
    getPublicListings({ category, transaction, areaSlug, query, minPrice, maxPrice, minArea, maxArea, minBedrooms, amenities, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    getPublicListings({ category, transaction, query, minPrice, maxPrice, minArea, maxArea, minBedrooms, amenities }),
  ])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const boundsPoolPrices = boundsPool.map((l) => l.price)
  const priceBoundMin = boundsPoolPrices.length ? Math.floor(Math.min(...boundsPoolPrices) / 100) * 100 : 0
  const priceBoundMax = boundsPoolPrices.length ? Math.ceil(Math.max(...boundsPoolPrices) / 1000) * 1000 : 1_000_000
  const priceStep = transaction === 'rent' ? 50 : 5_000

  const boundsPoolAreas = boundsPool.map((l) => l.areaSqm).filter((v): v is number => v != null)
  const areaBoundMin = boundsPoolAreas.length ? Math.floor(Math.min(...boundsPoolAreas) / 10) * 10 : 0
  const areaBoundMax = boundsPoolAreas.length ? Math.ceil(Math.max(...boundsPoolAreas) / 10) * 10 : 2_000
  const selectedListing = filtered.find((listing) => listing.slug === rawSelected)
  const isMapOpen = false

  // Transaction tabs clear advanced filters (price scales differ between Buy/Rent)
  const buyHref = transaction === 'sale'
    ? buildListingsHref(locale, { category, query, areaSlug })
    : buildListingsHref(locale, { transaction: 'sale', category, query, areaSlug })

  const rentHref = transaction === 'rent'
    ? buildListingsHref(locale, { category, query, areaSlug })
    : buildListingsHref(locale, {
        transaction: 'rent',
        category: category === 'land' ? undefined : category,
        query,
        areaSlug,
      })

  // Category pills — hide Land when Rent is active
  const CATEGORY_PILLS: { key: string; cat: PropertyCategory | undefined; label: string }[] = [
    { key: 'all',       cat: undefined,     label: t('listings.filterAll') },
    { key: 'house',     cat: 'house',       label: t('listings.filterHouse') },
    { key: 'apartment', cat: 'apartment',   label: t('listings.filterApartment') },
    { key: 'land',      cat: 'land',        label: t('listings.filterLand') },
  ]

  const categoryPills = CATEGORY_PILLS
    .filter((pill) => !(pill.key === 'land' && transaction === 'rent'))
    .map((pill) => ({
      ...pill,
      href: buildListingsHref(locale, { transaction, category: pill.cat, query, areaSlug, ...adv }),
      active: pill.cat === category,
    }))

  const mapAreas = areas
    .map((area) => {
      const areaCount = baseResults.filter((listing) => listing.areaSlug === area.slug).length
      return {
        slug: area.slug,
        label: locale === 'lo' ? area.nameLo : locale === 'zh' ? area.nameZh : area.nameEn,
        count: areaCount,
        href: buildListingsHref(locale, { transaction, category, query, areaSlug: area.slug, ...adv }),
        active: area.slug === areaSlug,
      }
    })
    .filter((area) => area.count > 0 || area.active)

  const allAreasHref = buildListingsHref(locale, { transaction, category, query, ...adv })

  const mapPins = filtered
    .filter((listing) => listing.lat != null && listing.lng != null)
    .map((listing) => {
      const { lat, lng } = offsetCoordinates(listing.lat as number, listing.lng as number, listing.id)
      return {
        slug: listing.slug,
        title: listing.titleEn,
        areaLabel: listing.areaSlug || '',
        href: `${buildListingsHref(locale, { transaction, category, query, areaSlug, selected: listing.slug, ...adv })}#listing-${listing.slug}`,
        active: listing.slug === selectedListing?.slug,
        lat,
        lng,
      }
    })

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('listings.pageTitle')}</h1>

        <div className={styles.controls}>
          {/* Transaction tabs */}
          <div className={styles.transactionTabs}>
            <a
              href={buyHref}
              className={`${styles.tab} ${transaction === 'sale' ? styles.tabActive : ''}`}
            >
              {t('listings.tabBuy')}
            </a>
            <a
              href={rentHref}
              className={`${styles.tab} ${transaction === 'rent' ? styles.tabActive : ''}`}
            >
              {t('listings.tabRent')}
            </a>
          </div>

          {/* Category pills */}
          <div className={styles.categoryPills}>
            {categoryPills.map(({ key, label, href, active }) => (
              <a
                key={key}
                href={href}
                className={`${styles.pill} ${active ? styles.pillActive : ''}`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Village filter pills */}
          <div className={styles.areaPills}>
            <div className={styles.areaPillsRow}>
              <a
                href={allAreasHref}
                className={`${styles.areaPill} ${!areaSlug ? styles.areaPillActive : ''}`}
              >
                {t('listings.areaAll')}
                <span className={styles.areaCount}>{baseResults.length}</span>
              </a>
              {mapAreas.map(({ slug, label, count, href, active }) => (
                <a
                  key={slug}
                  href={href}
                  className={`${styles.areaPill} ${active ? styles.areaPillActive : ''}`}
                >
                  {label}
                  <span className={styles.areaCount}>{count}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Unified search + advanced filters form */}
          <AutoSubmitForm action={`/${locale}/listings`} method="get" className={styles.filterForm}>
            {transaction && <input type="hidden" name="transaction" value={transaction} />}
            {category && <input type="hidden" name="category" value={category} />}
            {areaSlug && <input type="hidden" name="areaSlug" value={areaSlug} />}

            {/* Keyword search row */}
            <div className={styles.searchSection}>
              <label htmlFor="listing-search" className={styles.searchLabel}>
                {t('listings.searchLabel')}
              </label>
              <div className={styles.searchRow}>
                <input
                  id="listing-search"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder={t('listings.searchPlaceholder')}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton}>
                  {t('listings.searchButton')}
                </button>
                {query ? (
                  <a
                    href={buildListingsHref(locale, { transaction, category, areaSlug, ...adv })}
                    className={styles.clearButton}
                  >
                    {t('listings.clearSearch')}
                  </a>
                ) : null}
              </div>
            </div>

            {/* Advanced filters */}
            <FiltersPanel
              initiallyOpen={!!hasAdvancedFilters}
              label={t('listings.filterToggleLabel')}
              activeCount={activeFilterCount}
            >
            <div className={styles.advancedFilters}>
              {/* Price range */}
              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>{t('listings.filterPrice')}</span>
                <RangeSlider
                  nameMin="minPrice"
                  nameMax="maxPrice"
                  min={priceBoundMin}
                  max={priceBoundMax}
                  step={priceStep}
                  defaultMin={minPrice}
                  defaultMax={maxPrice}
                  prefix="$"
                />
              </div>

              {/* Area sqm */}
              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>{t('listings.filterArea')}</span>
                <RangeSlider
                  nameMin="minArea"
                  nameMax="maxArea"
                  min={areaBoundMin}
                  max={areaBoundMax}
                  step={10}
                  defaultMin={minArea}
                  defaultMax={maxArea}
                  suffix=" sqm"
                />
              </div>

              {/* Bedrooms — hidden for land */}
              {category !== 'land' && (
                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>{t('listings.filterBedrooms')}</span>
                  <div className={styles.bedroomPills}>
                    <label className={`${styles.bedroomPill} ${!minBedrooms ? styles.bedroomPillActive : ''}`}>
                      <input type="radio" name="minBedrooms" value="" defaultChecked={!minBedrooms} className={styles.srOnly} />
                      {t('listings.filterBedsAny')}
                    </label>
                    {([1, 2, 3, 4] as const).map((n) => (
                      <label key={n} className={`${styles.bedroomPill} ${minBedrooms === n ? styles.bedroomPillActive : ''}`}>
                        <input type="radio" name="minBedrooms" value={n} defaultChecked={minBedrooms === n} className={styles.srOnly} />
                        {n}+
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenity chips */}
              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>{t('listings.filterAmenities')}</span>
                <div className={styles.amenityChips}>
                  {(
                    [
                      { value: 'gym',     labelKey: 'listings.filterAmenityGym'     },
                      { value: 'pool',    labelKey: 'listings.filterAmenityPool'    },
                      { value: 'parking', labelKey: 'listings.filterAmenityParking' },
                    ] as const
                  ).map(({ value, labelKey }) => {
                    const checked = amenities?.includes(value)
                    return (
                      <label
                        key={value}
                        className={`${styles.amenityChip} ${checked ? styles.amenityChipActive : ''}`}
                      >
                        <input
                          type="checkbox"
                          name="amenities"
                          value={value}
                          defaultChecked={checked}
                          className={styles.srOnly}
                        />
                        {t(labelKey)}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className={styles.filterActions}>
                <button type="submit" className={styles.applyButton}>
                  {t('listings.applyFilters')}
                </button>
                {hasAdvancedFilters ? (
                  <a
                    href={buildListingsHref(locale, { transaction, category, query, areaSlug })}
                    className={styles.clearFilters}
                  >
                    {t('listings.clearFilters')}
                  </a>
                ) : null}
              </div>
            </div>
            </FiltersPanel>
          </AutoSubmitForm>
        </div>

        <ListingsMapPanel
          initiallyOpen={isMapOpen}
          showLabel={t('listings.mapToggleShow')}
          hideLabel={t('listings.mapToggleHide')}
          note={t('listings.mapNote')}
          pins={mapPins}
        />

        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((listing) => {
              const catLabel = t(`listing.category${listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}` as 'listing.categoryLand' | 'listing.categoryHouse' | 'listing.categoryApartment')
              const txLabel = t(`listing.transaction${listing.transaction.charAt(0).toUpperCase() + listing.transaction.slice(1)}` as 'listing.transactionSale' | 'listing.transactionRent')
              const typeLabel = listing.category === 'land' ? catLabel : `${catLabel} · ${txLabel}`
              return (
                <div
                  key={listing.id}
                  id={`listing-${listing.slug}`}
                  className={`${styles.cardShell} ${listing.slug === selectedListing?.slug ? styles.cardShellActive : ''}`}
                >
                  <ListingCard
                    listing={listing}
                    locale={locale}
                    typeLabel={typeLabel}
                    areaLabel={t('listing.area')}
                    sqmLabel={t('listing.sqm')}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <p className={styles.empty}>{t('listings.noResults')}</p>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          prevLabel={t('listings.paginationPrev')}
          nextLabel={t('listings.paginationNext')}
          buildHref={(p) => buildListingsHref(locale, { transaction, category, query, areaSlug, ...adv, page: p })}
        />
      </div>
    </div>
  )
}
