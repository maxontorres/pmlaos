import { formatPrice, listings, type Listing } from '@/lib/dummy'

export interface AdminUser {
  name: string
  role: string
}

export interface AdminClient {
  id: string
  name: string
  phone: string
  email: string
  interest: 'land' | 'house' | 'apartment' | 'rental'
  status: 'new' | 'active' | 'closed'
  budget: string
  lastContact: string
  assignedListingIds: string[]
}

export interface AdminSystemUser {
  id: string
  name: string
  phone: string
  role: 'admin' | 'employee'
  status: 'active' | 'inactive'
}

export interface AdminDeal {
  id: string
  clientName: string
  listingTitle: string
  dealValue: number
  currency: string
  commission: number
  closedAt: string
  transactionType: 'sale' | 'rent'
}

export const adminUser: AdminUser = {
  name: 'PM Employee',
  role: 'Listings and Clients',
}

export const adminClients: AdminClient[] = [
  {
    id: 'c1',
    name: 'Somsack Phommasak',
    phone: '+856 20 1234 5678',
    email: 'somsack@example.com',
    interest: 'land',
    status: 'active',
    budget: '$200,000 - $280,000',
    lastContact: '2 hours ago',
    assignedListingIds: ['1', '2'],
  },
  {
    id: 'c2',
    name: 'Khamphone Sivilay',
    phone: '+856 20 2345 6789',
    email: 'khamphone@example.com',
    interest: 'house',
    status: 'active',
    budget: '$300,000 - $700,000',
    lastContact: 'Today',
    assignedListingIds: ['3', '4'],
  },
  {
    id: 'c3',
    name: 'Bounmy Khammany',
    phone: '+856 20 3456 7890',
    email: 'bounmy@example.com',
    interest: 'rental',
    status: 'new',
    budget: '$600 - $1,500 / month',
    lastContact: 'New lead',
    assignedListingIds: ['6', '8'],
  },
  {
    id: 'c4',
    name: 'Soulivong Darasack',
    phone: '+856 20 4567 8901',
    email: 'soulivong@example.com',
    interest: 'apartment',
    status: 'closed',
    budget: '$150,000 - $220,000',
    lastContact: 'Last week',
    assignedListingIds: ['9'],
  },
  {
    id: 'c5',
    name: 'Sithong Phommachak',
    phone: '+856 20 5678 9012',
    email: 'sithong@example.com',
    interest: 'house',
    status: 'active',
    budget: '$1,500 - $3,000 / month',
    lastContact: 'Yesterday',
    assignedListingIds: ['7', '10'],
  },
]

export const adminSystemUsers: AdminSystemUser[] = [
  {
    id: 'u1',
    name: 'Maxon Phimmasone',
    phone: '+856 20 8888 1001',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'u2',
    name: 'Noy Sivilay',
    phone: '+856 20 8888 1002',
    role: 'employee',
    status: 'active',
  },
  {
    id: 'u3',
    name: 'Dara Phomvihane',
    phone: '+856 20 8888 1003',
    role: 'employee',
    status: 'active',
  },
  {
    id: 'u4',
    name: 'Kea Vilay',
    phone: '+856 20 8888 1004',
    role: 'employee',
    status: 'inactive',
  },
]

export function getAdminListings(): Listing[] {
  return listings
}

export function getDashboardListings(): Listing[] {
  return listings.slice(0, 5)
}

export function getDashboardClients(): AdminClient[] {
  return adminClients.slice(0, 5)
}

export function getListingStats() {
  const all = listings.length
  const available = listings.filter((listing) => listing.status === 'available').length
  const sold = listings.filter((listing) => listing.status === 'sold').length
  const rented = listings.filter((listing) => listing.status === 'rented').length

  return { all, available, sold, rented }
}

export function getClientStats() {
  const all = adminClients.length
  const active = adminClients.filter((client) => client.status === 'active').length
  const fresh = adminClients.filter((client) => client.status === 'new').length
  const closed = adminClients.filter((client) => client.status === 'closed').length

  return { all, active, fresh, closed }
}

export function getListingSummary(listing: Listing): string {
  return formatPrice(listing.price, listing.priceUnit)
}

export function getClientMatches(client: AdminClient): string {
  const matched = listings.filter((listing) => client.assignedListingIds.includes(listing.id))
  return matched.map((listing) => listing.titleEn).join(', ')
}

export function getUserStats() {
  const all = adminSystemUsers.length
  const active = adminSystemUsers.filter((user) => user.status === 'active').length
  const admins = adminSystemUsers.filter((user) => user.role === 'admin').length

  return { all, active, admins }
}

export const adminDeals: AdminDeal[] = [
  {
    id: 'd1',
    clientName: 'Somsack Phommasak',
    listingTitle: 'Modern House in Saysettha',
    dealValue: 85000,
    currency: 'USD',
    commission: 4250,
    closedAt: '2026-04-03',
    transactionType: 'sale',
  },
  {
    id: 'd2',
    clientName: 'Khamphone Sivilay',
    listingTitle: 'Downtown Studio Apartment',
    dealValue: 450,
    currency: 'USD',
    commission: 225,
    closedAt: '2026-03-28',
    transactionType: 'rent',
  },
  {
    id: 'd3',
    clientName: 'Bounmy Khammany',
    listingTitle: 'Land Plot near Airport',
    dealValue: 120000,
    currency: 'USD',
    commission: 6000,
    closedAt: '2026-03-15',
    transactionType: 'sale',
  },
  {
    id: 'd4',
    clientName: 'Soulivong Darasack',
    listingTitle: 'Family House with Pool',
    dealValue: 145000,
    currency: 'USD',
    commission: 7250,
    closedAt: '2026-02-20',
    transactionType: 'sale',
  },
  {
    id: 'd5',
    clientName: 'Sithong Phommachak',
    listingTitle: 'Luxury Condo Center',
    dealValue: 650,
    currency: 'USD',
    commission: 325,
    closedAt: '2026-02-10',
    transactionType: 'rent',
  },
]

export function getDealStats() {
  const totalCommission = adminDeals.reduce((sum, deal) => sum + deal.commission, 0)
  const thisMonth = adminDeals.filter((deal) => {
    const closed = new Date(deal.closedAt)
    const now = new Date()
    return closed.getMonth() === now.getMonth() && closed.getFullYear() === now.getFullYear()
  }).length
  const unitsSold = adminDeals.filter((deal) => deal.transactionType === 'sale').length
  const unitsRented = adminDeals.filter((deal) => deal.transactionType === 'rent').length

  return { totalCommission, thisMonth, unitsSold, unitsRented }
}

export function getDashboardDeals(): AdminDeal[] {
  return adminDeals.slice(0, 5)
}
