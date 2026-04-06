import AdminLayout from '@/components/admin/AdminLayout/AdminLayout'
import { adminSystemUsers, adminUser } from '@/lib/adminDummy'
import styles from '../admin.module.css'

export default function AdminUsersPage() {
  return (
    <AdminLayout
      user={adminUser}
      pageTitle="Users"
      pageDescription="System users."
    >
      <div className={styles.stack}>
        <section className={styles.recordList}>
          {adminSystemUsers.map((systemUser) => (
            <article key={systemUser.id} className={styles.recordCard}>
              <div className={styles.recordTop}>
                <div>
                  <h2 className={styles.recordTitle}>{systemUser.name}</h2>
                  <p className={styles.recordSubtle}>{systemUser.phone}</p>
                </div>
                <span className={`${styles.pill} ${styles[systemUser.status]}`}>{systemUser.status}</span>
              </div>
              <p className={styles.recordMeta}>{systemUser.role}</p>
            </article>
          ))}
        </section>
      </div>
    </AdminLayout>
  )
}
