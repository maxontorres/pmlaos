export type PropertyCategory = 'house' | 'apartment' | 'land'
export type TransactionType = 'sale' | 'rent'
export type PriceUnit = 'total' | 'per_month'
export type ListingArea = 'sikhottabong' | 'phonxay' | 'chanthabouly' | 'xaysetha'
export type AmenityKey =
  | 'pool'
  | 'gym'
  | 'garden'
  | 'security'
  | 'balcony'
  | 'terrace'
  | 'furnished'
  | 'pet_friendly'
  | 'wifi'
  | 'cleaning_service'
  | 'air_conditioning'
  | 'parking'
  | 'garage'
  | 'smart_home'
  | 'river_view'
  | 'office_space'
  | 'gated_compound'
  | 'title_deed'
  | 'road_frontage'
  | 'utilities'

export interface Listing {
  id: string
  slug: string
  area: ListingArea
  category: PropertyCategory
  transaction: TransactionType
  status: 'available' | 'sold' | 'rented' | 'hidden'
  featured: boolean
  titleEn: string
  locationEn: string
  descriptionEn: string
  price: number
  priceUnit: PriceUnit
  areaSqm: number | null
  bedrooms: number | null
  bathrooms: number | null
  parkingSpaces: number | null
  lat: number | null
  lng: number | null
  amenities: AmenityKey[]
  photos: string[]
}

const u = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80`

export const LISTING_AREAS: ListingArea[] = ['sikhottabong', 'phonxay', 'chanthabouly', 'xaysetha']

export const listings: Listing[] = [
  {
    id: '1',
    slug: 'prime-land-sikhottabong',
    area: 'sikhottabong',
    category: 'land',
    transaction: 'sale',
    status: 'available',
    featured: true,
    titleEn: 'Prime Land Plot in Sikhottabong',
    locationEn: 'Sikhottabong, Vientiane',
    descriptionEn:
      'An exceptional 800 sqm land plot in the heart of Sikhottabong district, one of Vientiane\'s most sought-after residential and commercial areas. The plot has road frontage on two sides, full utility connections (water, electricity, drainage), and a title deed (Nor Sor 3 Gor). Ideal for residential development, a boutique guesthouse, or commercial use. The surrounding area features established restaurants, international schools, and easy access to the city centre.',
    price: 245000,
    priceUnit: 'total',
    areaSqm: 800,
    bedrooms: null,
    bathrooms: null,
    parkingSpaces: null,
    lat: 17.9555,
    lng: 102.5795,
    amenities: ['road_frontage', 'utilities', 'title_deed'],
    photos: [
      u('photo-1500382017468-9049fed747ef'),
      u('photo-1464822759023-fed622ff2c3b'),
      u('photo-1416879595882-3373a0480b5b'),
    ],
  },
  {
    id: '2',
    slug: 'commercial-land-thadeua-road',
    area: 'xaysetha',
    category: 'land',
    transaction: 'sale',
    status: 'available',
    featured: false,
    titleEn: 'Commercial Land on Thadeua Road',
    locationEn: 'Xaysetha, Vientiane',
    descriptionEn:
      'A 1,200 sqm commercial-grade plot fronting the busy Thadeua Road in Xaysetha district. Perfectly positioned for a showroom, office complex, or mixed-use development. The land benefits from high daily traffic volume, proximity to the Mekong riverfront, and solid infrastructure. Title deed available. Viewing by appointment.',
    price: 420000,
    priceUnit: 'total',
    areaSqm: 1200,
    bedrooms: null,
    bathrooms: null,
    parkingSpaces: null,
    lat: 17.9452,
    lng: 102.6365,
    amenities: ['road_frontage', 'utilities', 'title_deed'],
    photos: [
      u('photo-1506905925346-21bda4d32df4'),
      u('photo-1500382017468-9049fed747ef'),
      u('photo-1463936575829-25148e1db1b8'),
    ],
  },
  {
    id: '3',
    slug: 'modern-villa-chanthabouly',
    area: 'chanthabouly',
    category: 'house',
    transaction: 'sale',
    status: 'available',
    featured: true,
    titleEn: 'Modern Villa in Chanthabouly',
    locationEn: 'Chanthabouly, Vientiane',
    descriptionEn:
      'A stunning contemporary villa set on a 600 sqm plot in the prestigious Chanthabouly district. Built in 2021, the 350 sqm home features four bedrooms, three bathrooms, an open-plan kitchen and living area, a private swimming pool, and a two-car garage. Finished to a high international standard with Italian tiles, custom joinery, and a full smart-home system. Walking distance to international schools, embassies, and the city\'s best dining.',
    price: 680000,
    priceUnit: 'total',
    areaSqm: 350,
    bedrooms: 4,
    bathrooms: 3,
    parkingSpaces: 2,
    lat: 17.9695,
    lng: 102.6125,
    amenities: ['pool', 'garage', 'smart_home', 'garden'],
    photos: [
      u('photo-1600596542815-ffad4c1539a9'),
      u('photo-1600585154340-be6161a56a0c'),
      u('photo-1502672260266-1c1ef2d93688'),
    ],
  },
  {
    id: '4',
    slug: 'family-home-phonxay',
    area: 'phonxay',
    category: 'house',
    transaction: 'sale',
    status: 'available',
    featured: false,
    titleEn: 'Spacious Family Home in Phonxay',
    locationEn: 'Phonxay, Vientiane',
    descriptionEn:
      'A well-maintained 220 sqm family home in the quiet, tree-lined neighbourhood of Phonxay. The property offers three bedrooms, two bathrooms, a large covered terrace, a mature garden with fruit trees, and secure parking. The layout is practical and light-filled, with tiled floors throughout and a recently upgraded kitchen. Suitable for families relocating to Vientiane, with several international schools within a five-minute drive.',
    price: 285000,
    priceUnit: 'total',
    areaSqm: 220,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    lat: 17.9742,
    lng: 102.6198,
    amenities: ['terrace', 'garden', 'parking'],
    photos: [
      u('photo-1583608205776-bfd35f0d9f83'),
      u('photo-1560185007-5f0bb1866cab'),
      u('photo-1523217582562-09d0def993a6'),
    ],
  },
  {
    id: '5',
    slug: 'townhouse-near-that-luang',
    area: 'xaysetha',
    category: 'house',
    transaction: 'sale',
    status: 'available',
    featured: false,
    titleEn: 'Townhouse near That Luang',
    locationEn: 'Xaysetha, Vientiane',
    descriptionEn:
      'A charming three-storey townhouse a short walk from the iconic That Luang stupa. The 180 sqm property includes three bedrooms, two bathrooms, a rooftop terrace with city views, and a compact courtyard garden. Ground floor is currently set up as a small office or studio, easily converted to additional living space. Good rental history if preferred as an investment.',
    price: 195000,
    priceUnit: 'total',
    areaSqm: 180,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 1,
    lat: 17.9498,
    lng: 102.6281,
    amenities: ['terrace', 'garden', 'office_space'],
    photos: [
      u('photo-1512917774080-9991f1c4c750'),
      u('photo-1558618666-fcd25c85cd64'),
      u('photo-1560448204-e02f11c3d0e2'),
    ],
  },
  {
    id: '6',
    slug: 'furnished-apartment-xaysetha',
    area: 'xaysetha',
    category: 'apartment',
    transaction: 'rent',
    status: 'available',
    featured: true,
    titleEn: 'Furnished Apartment in Xaysetha',
    locationEn: 'Xaysetha, Vientiane',
    descriptionEn:
      'A bright and fully furnished 85 sqm apartment on the third floor of a well-managed residential block in Xaysetha. The unit comprises two bedrooms, one bathroom, an open living and dining area, a fully equipped kitchen, and a private balcony. Included: air conditioning in all rooms, high-speed Wi-Fi, weekly cleaning service, and secured parking. Ideal for expats or professionals on a short to medium-term assignment.',
    price: 1200,
    priceUnit: 'per_month',
    areaSqm: 85,
    bedrooms: 2,
    bathrooms: 1,
    parkingSpaces: 1,
    lat: 17.9509,
    lng: 102.6338,
    amenities: ['furnished', 'balcony', 'wifi', 'cleaning_service', 'air_conditioning', 'parking'],
    photos: [
      u('photo-1502672260266-1c1ef2d93688'),
      u('photo-1560185007-5f0bb1866cab'),
      u('photo-1493809842364-78817add7ffb'),
    ],
  },
  {
    id: '7',
    slug: 'expat-villa-phonxay',
    area: 'phonxay',
    category: 'house',
    transaction: 'rent',
    status: 'available',
    featured: false,
    titleEn: 'Expat Villa with Pool in Phonxay',
    locationEn: 'Phonxay, Vientiane',
    descriptionEn:
      'A spacious 280 sqm detached villa in a gated compound in Phonxay, popular with the expat community. Four bedrooms, three bathrooms, a private swimming pool, a large covered outdoor dining area, and a double garage. The landlord maintains the pool and garden weekly. Minimum lease 12 months. Available from 1 June 2025.',
    price: 2800,
    priceUnit: 'per_month',
    areaSqm: 280,
    bedrooms: 4,
    bathrooms: 3,
    parkingSpaces: 2,
    lat: 17.9728,
    lng: 102.6171,
    amenities: ['pool', 'garage', 'garden', 'gated_compound'],
    photos: [
      u('photo-1613977257363-707ba9348227'),
      u('photo-1600596542815-ffad4c1539a9'),
      u('photo-1523217582562-09d0def993a6'),
    ],
  },
  {
    id: '8',
    slug: 'studio-mekong-riverside',
    area: 'chanthabouly',
    category: 'apartment',
    transaction: 'rent',
    status: 'available',
    featured: false,
    titleEn: 'Studio Apartment, Mekong Riverside',
    locationEn: 'Chanthabouly, Vientiane',
    descriptionEn:
      'A compact and stylish 45 sqm studio with partial river views, located steps from the Mekong riverside promenade in Chanthabouly. The apartment is fully furnished with a built-in kitchen, a queen bed, and a modern bathroom. Air conditioning, Wi-Fi, and a rooftop terrace are included. Perfect for a solo professional or couple. Flexible lease terms from three months.',
    price: 650,
    priceUnit: 'per_month',
    areaSqm: 45,
    bedrooms: 1,
    bathrooms: 1,
    parkingSpaces: null,
    lat: 17.9631,
    lng: 102.6078,
    amenities: ['furnished', 'wifi', 'air_conditioning', 'terrace', 'river_view'],
    photos: [
      u('photo-1493809842364-78817add7ffb'),
      u('photo-1502672260266-1c1ef2d93688'),
      u('photo-1560185007-5f0bb1866cab'),
    ],
  },
  {
    id: '9',
    slug: 'riverside-apartment-for-sale',
    area: 'chanthabouly',
    category: 'apartment',
    transaction: 'sale',
    status: 'available',
    featured: true,
    titleEn: 'Riverside Apartment for Sale',
    locationEn: 'Chanthabouly, Vientiane',
    descriptionEn:
      'A bright 110 sqm two-bedroom apartment on the fifth floor of a modern condominium building in Chanthabouly, offering partial Mekong river views. The unit features an open-plan living and dining area, a fully fitted kitchen, two bathrooms, and a covered balcony. Building amenities include a rooftop terrace, gym, and 24-hour security. Freehold title available for foreign nationals under a long-term lease structure.',
    price: 175000,
    priceUnit: 'total',
    areaSqm: 110,
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 1,
    lat: 17.9614,
    lng: 102.6045,
    amenities: ['balcony', 'terrace', 'gym', 'security', 'river_view'],
    photos: [
      u('photo-1493809842364-78817add7ffb'),
      u('photo-1560185007-5f0bb1866cab'),
      u('photo-1502672260266-1c1ef2d93688'),
    ],
  },
  {
    id: '10',
    slug: 'colonial-house-for-rent-chanthabouly',
    area: 'chanthabouly',
    category: 'house',
    transaction: 'rent',
    status: 'available',
    featured: false,
    titleEn: 'Colonial House for Rent in Chanthabouly',
    locationEn: 'Chanthabouly, Vientiane',
    descriptionEn:
      'A character-filled 240 sqm colonial-style house in a quiet street of Chanthabouly. Three bedrooms, two bathrooms, original wooden flooring, high ceilings, and a shaded veranda. The walled garden provides privacy and is maintained by the landlord. Walking distance to the French Cultural Centre and Vientiane\'s best cafés. Minimum six-month lease. Pet-friendly.',
    price: 1800,
    priceUnit: 'per_month',
    areaSqm: 240,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 1,
    lat: 17.9668,
    lng: 102.6092,
    amenities: ['garden', 'terrace', 'pet_friendly', 'parking'],
    photos: [
      u('photo-1583608205776-bfd35f0d9f83'),
      u('photo-1512917774080-9991f1c4c750'),
      u('photo-1523217582562-09d0def993a6'),
    ],
  },
]

export function getListingBySlug(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug)
}

export function getFeaturedListings(): Listing[] {
  return listings.filter((l) => l.featured && l.status === 'available')
}

export function getListings(
  category?: PropertyCategory,
  transaction?: TransactionType,
  query?: string,
  area?: ListingArea,
  minPrice?: number,
  maxPrice?: number,
  minArea?: number,
  maxArea?: number,
  minBedrooms?: number,
  amenities?: string[],
): Listing[] {
  const normalizedQuery = query?.trim().toLowerCase()

  return listings.filter((l) => {
    if (l.status !== 'available') return false
    if (category != null && l.category !== category) return false
    if (transaction != null && l.transaction !== transaction) return false
    if (area != null && l.area !== area) return false
    if (normalizedQuery) {
      if (![l.titleEn, l.locationEn, l.descriptionEn].some((f) => f.toLowerCase().includes(normalizedQuery))) return false
    }
    if (minPrice != null && l.price < minPrice) return false
    if (maxPrice != null && l.price > maxPrice) return false
    if (minArea != null || maxArea != null) {
      const sqm = getPrimaryAreaSqm(l)
      if (sqm != null) {
        if (minArea != null && sqm < minArea) return false
        if (maxArea != null && sqm > maxArea) return false
      }
    }
    if (minBedrooms != null && (l.bedrooms == null || l.bedrooms < minBedrooms)) return false
    if (amenities?.length && !amenities.every((a) => l.amenities.includes(a as AmenityKey))) return false
    return true
  })
}

export function getPrimaryAreaSqm(listing: Listing): number | null {
  return listing.areaSqm
}

export function formatPrice(price: number, priceUnit: PriceUnit): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
  return priceUnit === 'per_month' ? `${formatted}/mo` : formatted
}
