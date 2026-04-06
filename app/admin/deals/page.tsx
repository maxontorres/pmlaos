import AdminLayout from '@/components/admin/AdminLayout/AdminLayout'
import DealsManager from '@/components/admin/DealsManager/DealsManager'
import { adminUser, adminDeals, adminClients } from '@/lib/adminDummy'
import adminListingsSeed from '@/lib/adminListingsSeed.json'

export default function AdminDealsPage() {
  const listings = adminListingsSeed.map((listing) => ({
    id: listing.id,
    title: listing.titleEn,
    price: listing.price,
  }))

  const clients = adminClients.map((client) => ({
    id: client.id,
    name: client.name,
  }))

  return (
    <AdminLayout
      user={adminUser}
      pageTitle="Deals"
      pageDescription="Track closed deals and commissions."
    >
      <DealsManager
        initialDeals={adminDeals}
        listings={listings}
        clients={clients}
      />
    </AdminLayout>
  )
}
