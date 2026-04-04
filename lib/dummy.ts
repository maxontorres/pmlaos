export type PropertyType = 'land' | 'house' | 'rental'
export type PriceUnit = 'total' | 'per_month'

export interface Listing {
  id: string
  slug: string
  type: PropertyType
  status: 'available' | 'sold' | 'rented' | 'hidden'
  featured: boolean
  titleEn: string
  locationEn: string
  descriptionEn: string
  price: number
  priceUnit: PriceUnit
  areaSqm: number | null
  photos: string[]
}

const u = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80`

export const listings: Listing[] = [
  {
    id: '1',
    slug: 'prime-land-sikhottabong',
    type: 'land',
    status: 'available',
    featured: true,
    titleEn: 'Prime Land Plot in Sikhottabong',
    locationEn: 'Sikhottabong, Vientiane',
    descriptionEn:
      'An exceptional 800 sqm land plot in the heart of Sikhottabong district, one of Vientiane\'s most sought-after residential and commercial areas. The plot has road frontage on two sides, full utility connections (water, electricity, drainage), and a title deed (Nor Sor 3 Gor). Ideal for residential development, a boutique guesthouse, or commercial use. The surrounding area features established restaurants, international schools, and easy access to the city centre.',
    price: 245000,
    priceUnit: 'total',
    areaSqm: 800,
    photos: [
      u('photo-1500382017468-9049fed747ef'),
      u('photo-1464822759023-fed622ff2c3b'),
      u('photo-1416879595882-3373a0480b5b'),
    ],
  },
  {
    id: '2',
    slug: 'commercial-land-thadeua-road',
    type: 'land',
    status: 'available',
    featured: false,
    titleEn: 'Commercial Land on Thadeua Road',
    locationEn: 'Xaysetha, Vientiane',
    descriptionEn:
      'A 1,200 sqm commercial-grade plot fronting the busy Thadeua Road in Xaysetha district. Perfectly positioned for a showroom, office complex, or mixed-use development. The land benefits from high daily traffic volume, proximity to the Mekong riverfront, and solid infrastructure. Title deed available. Viewing by appointment.',
    price: 420000,
    priceUnit: 'total',
    areaSqm: 1200,
    photos: [
      u('photo-1506905925346-21bda4d32df4'),
      u('photo-1500382017468-9049fed747ef'),
      u('photo-1463936575829-25148e1db1b8'),
    ],
  },
  {
    id: '3',
    slug: 'modern-villa-chanthabouly',
    type: 'house',
    status: 'available',
    featured: true,
    titleEn: 'Modern Villa in Chanthabouly',
    locationEn: 'Chanthabouly, Vientiane',
    descriptionEn:
      'A stunning contemporary villa set on a 600 sqm plot in the prestigious Chanthabouly district. Built in 2021, the 350 sqm home features four bedrooms, three bathrooms, an open-plan kitchen and living area, a private swimming pool, and a two-car garage. Finished to a high international standard with Italian tiles, custom joinery, and a full smart-home system. Walking distance to international schools, embassies, and the city\'s best dining.',
    price: 680000,
    priceUnit: 'total',
    areaSqm: 350,
    photos: [
      u('photo-1600596542815-ffad4c1539a9'),
      u('photo-1600585154340-be6161a56a0c'),
      u('photo-1502672260266-1c1ef2d93688'),
    ],
  },
  {
    id: '4',
    slug: 'family-home-phonxay',
    type: 'house',
    status: 'available',
    featured: false,
    titleEn: 'Spacious Family Home in Phonxay',
    locationEn: 'Phonxay, Vientiane',
    descriptionEn:
      'A well-maintained 220 sqm family home in the quiet, tree-lined neighbourhood of Phonxay. The property offers three bedrooms, two bathrooms, a large covered terrace, a mature garden with fruit trees, and secure parking. The layout is practical and light-filled, with tiled floors throughout and a recently upgraded kitchen. Suitable for families relocating to Vientiane, with several international schools within a five-minute drive.',
    price: 285000,
    priceUnit: 'total',
    areaSqm: 220,
    photos: [
      u('photo-1583608205776-bfd35f0d9f83'),
      u('photo-1560185007-5f0bb1866cab'),
      u('photo-1523217582562-09d0def993a6'),
    ],
  },
  {
    id: '5',
    slug: 'townhouse-near-that-luang',
    type: 'house',
    status: 'available',
    featured: false,
    titleEn: 'Townhouse near That Luang',
    locationEn: 'Xaysetha, Vientiane',
    descriptionEn:
      'A charming three-storey townhouse a short walk from the iconic That Luang stupa. The 180 sqm property includes three bedrooms, two bathrooms, a rooftop terrace with city views, and a compact courtyard garden. Ground floor is currently set up as a small office or studio, easily converted to additional living space. Good rental history if preferred as an investment.',
    price: 195000,
    priceUnit: 'total',
    areaSqm: 180,
    photos: [
      u('photo-1512917774080-9991f1c4c750'),
      u('photo-1558618666-fcd25c85cd64'),
      u('photo-1560448204-e02f11c3d0e2'),
    ],
  },
  {
    id: '6',
    slug: 'furnished-apartment-xaysetha',
    type: 'rental',
    status: 'available',
    featured: true,
    titleEn: 'Furnished Apartment in Xaysetha',
    locationEn: 'Xaysetha, Vientiane',
    descriptionEn:
      'A bright and fully furnished 85 sqm apartment on the third floor of a well-managed residential block in Xaysetha. The unit comprises two bedrooms, one bathroom, an open living and dining area, a fully equipped kitchen, and a private balcony. Included: air conditioning in all rooms, high-speed Wi-Fi, weekly cleaning service, and secured parking. Ideal for expats or professionals on a short to medium-term assignment.',
    price: 1200,
    priceUnit: 'per_month',
    areaSqm: 85,
    photos: [
      u('photo-1502672260266-1c1ef2d93688'),
      u('photo-1560185007-5f0bb1866cab'),
      u('photo-1493809842364-78817add7ffb'),
    ],
  },
  {
    id: '7',
    slug: 'expat-villa-phonxay',
    type: 'rental',
    status: 'available',
    featured: false,
    titleEn: 'Expat Villa with Pool in Phonxay',
    locationEn: 'Phonxay, Vientiane',
    descriptionEn:
      'A spacious 280 sqm detached villa in a gated compound in Phonxay, popular with the expat community. Four bedrooms, three bathrooms, a private swimming pool, a large covered outdoor dining area, and a double garage. The landlord maintains the pool and garden weekly. Minimum lease 12 months. Available from 1 June 2025.',
    price: 2800,
    priceUnit: 'per_month',
    areaSqm: 280,
    photos: [
      u('photo-1613977257363-707ba9348227'),
      u('photo-1600596542815-ffad4c1539a9'),
      u('photo-1523217582562-09d0def993a6'),
    ],
  },
  {
    id: '8',
    slug: 'studio-mekong-riverside',
    type: 'rental',
    status: 'available',
    featured: false,
    titleEn: 'Studio Apartment, Mekong Riverside',
    locationEn: 'Chanthabouly, Vientiane',
    descriptionEn:
      'A compact and stylish 45 sqm studio with partial river views, located steps from the Mekong riverside promenade in Chanthabouly. The apartment is fully furnished with a built-in kitchen, a queen bed, and a modern bathroom. Air conditioning, Wi-Fi, and a rooftop terrace are included. Perfect for a solo professional or couple. Flexible lease terms from three months.',
    price: 650,
    priceUnit: 'per_month',
    areaSqm: 45,
    photos: [
      u('photo-1493809842364-78817add7ffb'),
      u('photo-1502672260266-1c1ef2d93688'),
      u('photo-1560185007-5f0bb1866cab'),
    ],
  },
]

export function getListingBySlug(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug)
}

export function getFeaturedListings(): Listing[] {
  return listings.filter((l) => l.featured && l.status === 'available')
}

export function getListingsByType(type: PropertyType | null): Listing[] {
  if (!type) return listings.filter((l) => l.status === 'available')
  return listings.filter((l) => l.type === type && l.status === 'available')
}

export function formatPrice(price: number, priceUnit: PriceUnit): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
  return priceUnit === 'per_month' ? `${formatted}/mo` : formatted
}
