import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout'
import {
  adminUser,
  getClientStats,
  getListingStats,
} from '@/lib/adminDummy'
import styles from './admin.module.css'

export default function AdminDashboardPage() {
  const listingStats = getListingStats()
  const clientStats = getClientStats()

  return (
    <AdminLayout
      user={adminUser}
      pageTitle="Dashboard"
      pageDescription="Quick access only."
    >
      <div className={styles.stack}>
        <section className={styles.quickGrid}>
          <Link href="/admin/listings" className={styles.quickCard}>
            <span className={styles.quickTitle}>Listings</span>
            <span className={styles.quickMeta}>{listingStats.available} available</span>
          </Link>

          <Link href="/admin/clients" className={styles.quickCard}>
            <span className={styles.quickTitle}>Clients</span>
            <span className={styles.quickMeta}>{clientStats.fresh} new leads</span>
          </Link>
        </section>
      </div>
    </AdminLayout>
  )
}
