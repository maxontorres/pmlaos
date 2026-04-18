import { Suspense } from 'react'
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout'
import ListingsManager from '@/components/admin/ListingsManager/ListingsManager'
import { auth } from '@/lib/auth'

export default async function AdminListingsPage() {
  const session = await auth()
  const user = {
    name: session?.user?.name ?? 'Admin',
    role: ((session?.user as { role?: string } | undefined)?.role ?? 'admin'),
    image: session?.user?.image,
  }

  return (
    <AdminLayout
      user={user}
      pageTitle="Listings"
      pageDescription="Create, edit, and manage listings."
    >
      <Suspense>
        <ListingsManager canDelete={user.role === 'admin'} />
      </Suspense>
    </AdminLayout>
  )
}
