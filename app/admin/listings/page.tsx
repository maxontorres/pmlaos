import AdminLayout from '@/components/admin/AdminLayout/AdminLayout'
import ListingsManager from '@/components/admin/ListingsManager/ListingsManager'
import { auth } from '@/lib/auth'
import adminListingsSeed from '@/lib/adminListingsSeed.json'

export default async function AdminListingsPage() {
  const session = await auth()
  const user = {
    name: session?.user?.name ?? 'Admin',
    role: ((session?.user as { role?: string } | undefined)?.role ?? 'session required'),
  }

  return (
    <AdminLayout
      user={user}
      pageTitle="Listings"
      pageDescription="Create, edit, and manage listings."
    >
      <ListingsManager
        canDelete
        initialListings={adminListingsSeed}
        useLocalData
      />
    </AdminLayout>
  )
}
