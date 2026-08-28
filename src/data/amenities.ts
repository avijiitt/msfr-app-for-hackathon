import { Amenity } from '../types/transit';

/**
 * Generates realistic nearby stores, pharmacies, cafes, hospitals, and amenities
 * within 500 meters of any user-selected location or route stop.
 */
export function generateAmenitiesForLocation(
  locationName: string = 'Bhubaneswar Central',
  coords: [number, number] = [20.2961, 85.8245]
): Amenity[] {
  const cleanLoc = locationName
    ? locationName.split(',')[0].trim()
    : 'Local Hub';
  const baseLat = coords?.[0] || 20.2961;
  const baseLng = coords?.[1] || 85.8245;

  const templates: Array<{
    idSuffix: string;
    name: string;
    category: Amenity['category'];
    address: string;
    distanceMeters: number;
    isOpen24x7: boolean;
    isOpenNow: boolean;
    openHours: string;
    phone?: string;
    rating: number;
    userReviewsCount: number;
    priceLevel: '₹' | '₹₹' | '₹₹₹';
    dLat: number;
    dLng: number;
  }> = [
    // 🛒 Groceries & Supermarkets (< 500m)
    {
      idSuffix: 'gro-1',
      name: `Reliance Smart Bazaar — ${cleanLoc}`,
      category: 'supermarket',
      address: `Main Market Road, Near ${cleanLoc} Transit Hub`,
      distanceMeters: 85,
      isOpen24x7: false,
      isOpenNow: true,
      openHours: '07:00 AM - 10:30 PM',
      phone: '0674-2531122',
      rating: 4.7,
      userReviewsCount: 1240,
      priceLevel: '₹₹',
      dLat: 0.0008,
      dLng: 0.0006,
    },
    {
      idSuffix: 'gro-2',
      name: `Blinkit / Zepto 10-Min Dark Store (${cleanLoc})`,
      category: 'supermarket',
      address: `Shop 4, Commercial Complex, ${cleanLoc}`,
      distanceMeters: 140,
      isOpen24x7: true,
      isOpenNow: true,
      openHours: 'Open 24 Hours',
      phone: '1800-208-8888',
      rating: 4.8,
      userReviewsCount: 890,
      priceLevel: '₹₹',
      dLat: -0.0011,
      dLng: 0.0009,
    },
    {
      idSuffix: 'gro-3',
      name: `Mother Dairy & Daily Fresh Mart (${cleanLoc})`,
      category: 'supermarket',
      address: `Opposite ${cleanLoc} Passenger Bus Stop`,
      distanceMeters: 260,
      isOpen24x7: false,
      isOpenNow: true,
      openHours: '06:00 AM - 10:00 PM',
      phone: '0674-2490111',
      rating: 4.5,
      userReviewsCount: 430,
      priceLevel: '₹',
      dLat: 0.0015,
      dLng: -0.0018,
    },

    // 💊 24x7 Pharmacies & Clinics (< 500m)
    {
      idSuffix: 'phr-1',
      name: `Apollo 24x7 Pharmacy & First Aid Clinic`,
      category: 'pharmacy',
      address: `Plot 12, Main Street, ${cleanLoc}`,
      distanceMeters: 65,
      isOpen24x7: true,
      isOpenNow: true,
      openHours: 'Open 24 Hours',
      phone: '1860-500-0101',
      rating: 4.9,
      userReviewsCount: 1650,
      priceLevel: '₹₹',
      dLat: -0.0005,
      dLng: -0.0004,
    },
    {
      idSuffix: 'phr-2',
      name: `MedPlus 24-Hour Medical Store (${cleanLoc})`,
      category: 'pharmacy',
      address: `Near ${cleanLoc} Junction Gate 1`,
      distanceMeters: 190,
      isOpen24x7: true,
      isOpenNow: true,
      openHours: 'Open 24 Hours',
      phone: '0674-2554433',
      rating: 4.6,
      userReviewsCount: 520,
      priceLevel: '₹₹',
      dLat: 0.0012,
      dLng: 0.0014,
    },
    {
      idSuffix: 'phr-3',
      name: `Jan Aushadhi Kendra (Affordable Generic Medicines)`,
      category: 'pharmacy',
      address: `${cleanLoc} Transit Shelter Arcade`,
      distanceMeters: 310,
      isOpen24x7: false,
      isOpenNow: true,
      openHours: '08:00 AM - 09:30 PM',
      phone: '0674-2741999',
      rating: 4.7,
      userReviewsCount: 380,
      priceLevel: '₹',
      dLat: -0.0021,
      dLng: -0.0012,
    },

    // 🏥 Hospitals & Emergency Blood Banks (< 500m)
    {
      idSuffix: 'hsp-1',
      name: `${cleanLoc} Emergency Trauma & Blood Point`,
      category: 'hospital',
      address: `Hospital Square, Sector 2, ${cleanLoc}`,
      distanceMeters: 230,
      isOpen24x7: true,
      isOpenNow: true,
      openHours: 'Open 24 Hours',
      phone: '0674-2476789',
      rating: 4.8,
      userReviewsCount: 2840,
      priceLevel: '₹',
      dLat: 0.0018,
      dLng: -0.0015,
    },

    // ☕ Cafes & Quick Bites (< 500m)
    {
      idSuffix: 'caf-1',
      name: `Chai Break & Baker's Cafe (${cleanLoc})`,
      category: 'cafe',
      address: `Near ${cleanLoc} Passenger Terminal`,
      distanceMeters: 110,
      isOpen24x7: false,
      isOpenNow: true,
      openHours: '07:30 AM - 11:00 PM',
      phone: '0674-2549988',
      rating: 4.6,
      userReviewsCount: 780,
      priceLevel: '₹₹',
      dLat: -0.0009,
      dLng: 0.0007,
    },
    {
      idSuffix: 'caf-2',
      name: `Cafe Coffee Day Express & Snacks (${cleanLoc})`,
      category: 'cafe',
      address: `${cleanLoc} Commercial Concourse`,
      distanceMeters: 220,
      isOpen24x7: false,
      isOpenNow: true,
      openHours: '08:00 AM - 10:30 PM',
      phone: '0674-2591100',
      rating: 4.4,
      userReviewsCount: 460,
      priceLevel: '₹₹',
      dLat: 0.0017,
      dLng: 0.0011,
    },

    // 👮 Police & Women Safety Help Kiosk (< 500m)
    {
      idSuffix: 'pol-1',
      name: `${cleanLoc} Women Safety & Police Help Booth`,
      category: 'police',
      address: `${cleanLoc} Main Exit & CCTV Post`,
      distanceMeters: 45,
      isOpen24x7: true,
      isOpenNow: true,
      openHours: 'Open 24 Hours',
      phone: '112 / 1091',
      rating: 4.9,
      userReviewsCount: 510,
      priceLevel: '₹',
      dLat: 0.0003,
      dLng: -0.0003,
    },

    // ⚡ EV Charging Hub (< 500m)
    {
      idSuffix: 'ev-1',
      name: `Tata Power EV Fast Charger (60kW Hub)`,
      category: 'ev_charging',
      address: `${cleanLoc} Municipal Smart Parking`,
      distanceMeters: 150,
      isOpen24x7: true,
      isOpenNow: true,
      openHours: 'Open 24 Hours',
      phone: '1800-209-5161',
      rating: 4.8,
      userReviewsCount: 320,
      priceLevel: '₹₹',
      dLat: -0.0013,
      dLng: -0.0011,
    },

    // 🏨 Transit Hotel (< 500m)
    {
      idSuffix: 'htl-1',
      name: `Ginger Transit Hotel & Hourly Rooms (${cleanLoc})`,
      category: 'hotel',
      address: `Civil Lines, Adjacent to ${cleanLoc}`,
      distanceMeters: 390,
      isOpen24x7: true,
      isOpenNow: true,
      openHours: 'Open 24 Hours',
      phone: '0674-6663333',
      rating: 4.5,
      userReviewsCount: 1120,
      priceLevel: '₹₹₹',
      dLat: 0.0028,
      dLng: 0.0022,
    },

    // 🚻 Accessible Restroom (< 500m)
    {
      idSuffix: 'rst-1',
      name: `Clean Public Smart Restroom & Washroom`,
      category: 'restroom',
      address: `${cleanLoc} Shelter Ground Floor`,
      distanceMeters: 40,
      isOpen24x7: true,
      isOpenNow: true,
      openHours: 'Open 24 Hours',
      rating: 4.6,
      userReviewsCount: 190,
      priceLevel: '₹',
      dLat: 0.0002,
      dLng: 0.0004,
    },
  ];

  return templates.map((t) => ({
    id: `AM-${cleanLoc.toLowerCase().replace(/\s+/g, '-')}-${t.idSuffix}`,
    name: t.name,
    category: t.category,
    lat: baseLat + t.dLat,
    lng: baseLng + t.dLng,
    address: t.address,
    distanceMeters: t.distanceMeters,
    isOpen24x7: t.isOpen24x7,
    isOpenNow: t.isOpenNow,
    openHours: t.openHours,
    phone: t.phone,
    rating: t.rating,
    userReviewsCount: t.userReviewsCount,
    priceLevel: t.priceLevel,
  }));
}

export const MOCK_AMENITIES: Amenity[] = generateAmenitiesForLocation('Master Canteen, Bhubaneswar', [20.2685, 85.8450]);

