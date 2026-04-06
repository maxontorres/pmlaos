import AdminLayout from '@/components/admin/AdminLayout/AdminLayout'
import ClientsManager from '@/components/admin/ClientsManager/ClientsManager'
import { auth } from '@/lib/auth'
import adminClientsSeed from '@/lib/adminClientsSeed.json'
import styles from '../admin.module.css'

export default async function AdminClientsPage() {
  const session = await auth()
  const user = {
    name: session?.user?.name ?? 'Admin',
    role: ((session?.user as { role?: string } | undefined)?.role ?? 'session required'),
  }

  return (
    <AdminLayout
      user={user}
      pageTitle="Clients"
      pageDescription="Create, edit, and manage clients."
    >
      <div className={styles.stack}>


        <ClientsManager initialClients={adminClientsSeed} userRole={user.role} />
      </div>
    </AdminLayout>
  )
}
