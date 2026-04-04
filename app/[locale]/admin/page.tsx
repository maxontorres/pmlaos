import Link from 'next/link'
import { auth } from '@/lib/auth'
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout'
import styles from './page.module.css'

const listingsData = {
  total: 24,
  available: 18,
  sold: 4,
  rented: 2,
}

const clientsData = {
  total: 12,
  active: 8,
  new: 3,
  lost: 1,
}

const recentListings = [
  { id: 1, title: 'Prime Land Near That Luang', type: 'land', price: '$45,000', status: 'available' },
  { id: 2, title: 'Modern Villa in Green City', type: 'house', price: '$120,000', status: 'available' },
  { id: 3, title: 'Downtown Studio Apartment', type: 'rental', price: '$350/mo', status: 'rented' },
  { id: 4, title: 'Commercial Space Main Street', type: 'rental', price: '$800/mo', status: 'sold' },
  { id: 5, title: 'Riverside Land Vientiane', type: 'land', price: '$65,000', status: 'available' },
]

const recentClients = [
  { id: 1, name: 'Somsack Phommasak', phone: '+856 20 1234 5678', interest: 'land', status: 'active' },
  { id: 2, name: 'Khamphone Sivilay', phone: '+856 20 2345 6789', interest: 'house', status: 'active' },
  { id: 3, name: 'Bounmy Khammany', phone: '+856 20 3456 7890', interest: 'rental', status: 'new' },
  { id: 4, name: 'Soulivong Darasack', phone: '+856 20 4567 8901', interest: 'land', status: 'closed' },
  { id: 5, name: 'Sithong Phommachak', phone: '+856 20 5678 9012', interest: 'house', status: 'active' },
]

const typeIcons: Record<string, string> = {
  land: '🏞',
  house: '🏠',
  rental: '🏢',
}

export default async function AdminDashboard() {
  const session = await auth()
  const user = {
    name: session?.user?.name ?? 'Admin',
    email: session?.user?.email ?? 'admin@pmlaos.com',
    role: (session?.user as { role?: string })?.role ?? 'admin',
  }

  return (
    <AdminLayout user={user} pageTitle="Dashboard">
      <div className={styles.container}>
        <section className={styles.entitySection}>
          <div className={styles.entityHeader}>
            <div className={styles.entityTitle}>
              <div className={`${styles.entityIcon} ${styles.listings}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className={styles.entityTitleText}>
                <h2>Listings</h2>
                <p>Manage your property listings</p>
              </div>
            </div>
            <div className={styles.entityActions}>
              <span className={styles.statBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                {listingsData.available} available
              </span>
              <Link href="/admin/listings/new" className={styles.btnPrimary}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Listing
              </Link>
            </div>
          </div>
          <div className={styles.entityContent}>
            <div className={styles.entityStats}>
              <div className={styles.entityStat}>
                <span className={styles.entityStatLabel}>Total</span>
                <span className={styles.entityStatValue}>{listingsData.total}</span>
              </div>
              <div className={styles.entityStat}>
                <span className={styles.entityStatLabel}>Available</span>
                <span className={`${styles.entityStatValue} ${styles.success}`}>{listingsData.available}</span>
              </div>
              <div className={styles.entityStat}>
                <span className={styles.entityStatLabel}>Sold</span>
                <span className={`${styles.entityStatValue} ${styles.danger}`}>{listingsData.sold}</span>
              </div>
              <div className={styles.entityStat}>
                <span className={styles.entityStatLabel}>Rented</span>
                <span className={`${styles.entityStatValue} ${styles.warning}`}>{listingsData.rented}</span>
              </div>
            </div>
            <table className={styles.entityTable}>
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentListings.map((listing) => (
                  <tr key={listing.id}>
                    <td><span className={styles.typeIcon}>{typeIcons[listing.type]}</span></td>
                    <td>{listing.title}</td>
                    <td className={styles.priceCell}>{listing.price}</td>
                    <td><span className={`${styles.badge} ${styles[listing.status]}`}>{listing.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link href="/admin/listings" className={styles.viewAll}>View all listings →</Link>
          </div>
        </section>

        <section className={styles.entitySection}>
          <div className={styles.entityHeader}>
            <div className={styles.entityTitle}>
              <div className={`${styles.entityIcon} ${styles.clients}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className={styles.entityTitleText}>
                <h2>Clients</h2>
                <p>Manage your client relationships</p>
              </div>
            </div>
            <div className={styles.entityActions}>
              <span className={styles.statBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                {clientsData.active} active
              </span>
              <Link href="/admin/clients/new" className={styles.btnPrimary}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Client
              </Link>
            </div>
          </div>
          <div className={styles.entityContent}>
            <div className={styles.entityStats}>
              <div className={styles.entityStat}>
                <span className={styles.entityStatLabel}>Total</span>
                <span className={styles.entityStatValue}>{clientsData.total}</span>
              </div>
              <div className={styles.entityStat}>
                <span className={styles.entityStatLabel}>Active</span>
                <span className={`${styles.entityStatValue} ${styles.success}`}>{clientsData.active}</span>
              </div>
              <div className={styles.entityStat}>
                <span className={styles.entityStatLabel}>New</span>
                <span className={`${styles.entityStatValue} ${styles.warning}`}>{clientsData.new}</span>
              </div>
              <div className={styles.entityStat}>
                <span className={styles.entityStatLabel}>Lost</span>
                <span className={`${styles.entityStatValue} ${styles.danger}`}>{clientsData.lost}</span>
              </div>
            </div>
            <table className={styles.entityTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Interest</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td className={styles.phoneCell}>{client.phone}</td>
                    <td><span className={styles.typeIcon}>{typeIcons[client.interest]}</span></td>
                    <td><span className={`${styles.badge} ${styles[client.status]}`}>{client.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link href="/admin/clients" className={styles.viewAll}>View all clients →</Link>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
