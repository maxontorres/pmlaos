import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout'
import StatCard from '@/components/admin/StatCard/StatCard'
import {
  adminUser,
  getClientStats,
  getDealStats,
  getDashboardDeals,
  getListingStats,
} from '@/lib/adminDummy'
import styles from './admin.module.css'

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function AdminDashboardPage() {
  const listingStats = getListingStats()
  const clientStats = getClientStats()
  const dealStats = getDealStats()
  const recentDeals = getDashboardDeals()

  return (
    <AdminLayout
      user={adminUser}
      pageTitle="Dashboard"
      pageDescription="Quick access only."
    >
      <div className={styles.stack}>
        <section className={styles.statsGrid}>
          <Link href="/admin/listings" className={styles.quickCard}>
            <span className={styles.quickTitle}>Listings</span>
            <span className={styles.quickMeta}>{listingStats.available} available</span>
          </Link>

          <Link href="/admin/clients" className={styles.quickCard}>
            <span className={styles.quickTitle}>Clients</span>
            <span className={styles.quickMeta}>{clientStats.fresh} new leads</span>
          </Link>

          <Link href="/admin/deals" className={styles.quickCard}>
            <span className={styles.quickTitle}>Deals This Month</span>
            <span className={styles.quickMeta}>{dealStats.thisMonth} closed</span>
          </Link>
        </section>

        <section className={styles.statsGrid}>
          <StatCard
            label="Total Commission"
            value={formatCurrency(dealStats.totalCommission)}
            icon={<DollarIcon />}
            variant="success"
          />
          <StatCard
            label="Units Sold"
            value={dealStats.unitsSold}
            icon={<HomeIcon />}
            variant="primary"
          />
          <StatCard
            label="Units Rented"
            value={dealStats.unitsRented}
            icon={<KeyIcon />}
            variant="accent"
          />
        </section>

        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Deals</h2>
            <Link href="/admin/deals" className={styles.sectionLink}>
              View all
            </Link>
          </div>

          <div className={styles.dealsTable}>
            <div className={styles.tableHeader}>
              <span>Date</span>
              <span>Client</span>
              <span>Property</span>
              <span className={styles.alignRight}>Value</span>
              <span className={styles.alignRight}>Commission</span>
            </div>

            {recentDeals.map((deal) => (
              <div key={deal.id} className={styles.tableRow}>
                <span className={styles.tableDate}>{formatDate(deal.closedAt)}</span>
                <span className={styles.tableClient}>{deal.clientName}</span>
                <span className={styles.tableProperty}>{deal.listingTitle}</span>
                <span className={`${styles.alignRight} ${styles.tableValue}`}>
                  {formatCurrency(deal.dealValue, deal.currency)}
                  {deal.transactionType === 'rent' && (
                    <span className={styles.perMonth}>/mo</span>
                  )}
                </span>
                <span className={`${styles.alignRight} ${styles.tableCommission}`}>
                  {formatCurrency(deal.commission)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

function DollarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
    </svg>
  )
}
