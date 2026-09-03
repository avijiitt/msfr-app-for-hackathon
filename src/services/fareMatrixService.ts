import { BHUBANESWAR_LOCALITIES, BHUBANESWAR_STATIONS } from '../data/cities/bhubaneswar';

export interface TransitModeFare {
  mode: 'bus' | 'metro' | 'train' | 'auto' | 'cab' | 'bike' | 'ferry';
  title: string;
  category: 'Public Transit' | 'Shared Mobility' | 'On-Demand';
  fareInr: number;
  concessionFareInr?: number;
  durationMins: number;
  carbonGrams: number;
  availability: 'High Frequency (Every 3-5 mins)' | 'Available on Stand' | 'Instant Booking' | 'Scheduled';
  badge: string;
  color: string;
  icon: string;
}

export interface AreaFareComparison {
  origin: string;
  destination: string;
  estimatedDistanceKm: number;
  modes: TransitModeFare[];
}

/**
 * Automatically calculates road distance in km between any two places
 */
export function calculateDistanceBetweenLocations(
  originQuery: string,
  destQuery: string,
  originCoords?: [number, number] | null,
  destCoords?: [number, number] | null
): number {
  let lat1 = originCoords?.[0];
  let lon1 = originCoords?.[1];
  let lat2 = destCoords?.[0];
  let lon2 = destCoords?.[1];

  const normOrig = (originQuery || '').toLowerCase().trim();
  const normDest = (destQuery || '').toLowerCase().trim();

  // 1. Resolve coordinates from localities & stations if not provided
  if (!lat1 || !lon1) {
    const locMatch = BHUBANESWAR_LOCALITIES.find(
      (l) => normOrig.includes(l.id) || l.name.toLowerCase().includes(normOrig) || normOrig.includes(l.name.toLowerCase().split('/')[0].trim())
    );
    if (locMatch) {
      lat1 = locMatch.lat;
      lon1 = locMatch.lng;
    } else {
      const stMatch = BHUBANESWAR_STATIONS.find((s) => s.name.toLowerCase().includes(normOrig) || normOrig.includes(s.name.toLowerCase()));
      if (stMatch) {
        lat1 = stMatch.lat;
        lon1 = stMatch.lng;
      }
    }
  }

  if (!lat2 || !lon2) {
    const locMatch = BHUBANESWAR_LOCALITIES.find(
      (l) => normDest.includes(l.id) || l.name.toLowerCase().includes(normDest) || normDest.includes(l.name.toLowerCase().split('/')[0].trim())
    );
    if (locMatch) {
      lat2 = locMatch.lat;
      lon2 = locMatch.lng;
    } else {
      const stMatch = BHUBANESWAR_STATIONS.find((s) => s.name.toLowerCase().includes(normDest) || normDest.includes(s.name.toLowerCase()));
      if (stMatch) {
        lat2 = stMatch.lat;
        lon2 = stMatch.lng;
      }
    }
  }

  // 2. If both coordinates are resolved, calculate Great-Circle * 1.25 for road factor
  if (lat1 && lon1 && lat2 && lon2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const directKm = R * c;
    const roadKm = Math.round(directKm * 1.28 * 10) / 10;
    return Math.max(1.0, Math.min(60, roadKm));
  }

  // 3. Fallback heuristic
  if (normOrig && normDest) {
    if (normOrig === normDest) return 1.5;
    return 8.5;
  }

  return 6.0;
}

/**
 * Official CRUT / AMA BUS Fare Stages for Non-AC Bus Services
 * Stages 1 to 25 (w.e.f 01-12-2019)
 */
export function calculateAmaBusNonAcFare(distanceKm: number): number {
  const km = Math.max(0, distanceKm);
  if (km <= 4) return 5;
  if (km <= 8) return 10;
  if (km <= 12) return 15;
  if (km <= 17) return 20;
  if (km <= 22) return 25;
  if (km <= 27) return 30;
  if (km <= 33) return 35;
  if (km <= 39) return 40;
  if (km <= 45) return 45;
  if (km <= 51) return 50;
  if (km <= 57) return 55;
  if (km <= 63) return 60;
  if (km <= 69) return 65;
  if (km <= 75) return 70;
  if (km <= 81) return 75;
  if (km <= 87) return 80;
  if (km <= 93) return 85;
  if (km <= 99) return 90;
  if (km <= 105) return 95;
  if (km <= 111) return 100;
  if (km <= 117) return 105;
  if (km <= 123) return 110;
  if (km <= 129) return 115;
  if (km <= 135) return 120;
  if (km <= 141) return 125;
  return 125 + Math.ceil((km - 141) / 6) * 5;
}

/**
 * Official CRUT / AMA BUS Fare Stages for AC Bus Services
 * Stages 1 to 26 (w.e.f 01-12-2019)
 */
export function calculateAmaBusAcFare(distanceKm: number): number {
  const km = Math.max(0, distanceKm);
  if (km <= 2) return 5;
  if (km <= 4) return 10;
  if (km <= 7) return 15;
  if (km <= 10) return 20;
  if (km <= 14) return 25;
  if (km <= 18) return 30;
  if (km <= 22) return 35;
  if (km <= 27) return 40;
  if (km <= 32) return 45;
  if (km <= 37) return 50;
  if (km <= 43) return 55;
  if (km <= 49) return 60;
  if (km <= 55) return 65;
  if (km <= 61) return 70;
  if (km <= 67) return 75;
  if (km <= 73) return 80;
  if (km <= 79) return 85;
  if (km <= 85) return 90;
  if (km <= 91) return 95;
  if (km <= 97) return 100;
  if (km <= 103) return 105;
  if (km <= 109) return 110;
  if (km <= 115) return 115;
  if (km <= 121) return 120;
  if (km <= 127) return 125;
  if (km <= 133) return 130;
  return 130 + Math.ceil((km - 133) / 6) * 5;
}

/**
 * Check if the trip is strictly within the Bhubaneswar / CRUT Capital Region
 */
export function isBhubaneswarRegion(
  originQuery?: string,
  destQuery?: string,
  originCoords?: [number, number] | null,
  destCoords?: [number, number] | null
): boolean {
  // If coordinates are given, check against Bhubaneswar & CRUT bounding box
  if (originCoords && destCoords) {
    const [lat1, lng1] = originCoords;
    const [lat2, lng2] = destCoords;
    const inBbsr1 = lat1 >= 19.6 && lat1 <= 20.7 && lng1 >= 85.2 && lng1 <= 86.4;
    const inBbsr2 = lat2 >= 19.6 && lat2 <= 20.7 && lng2 >= 85.2 && lng2 <= 86.4;
    return inBbsr1 && inBbsr2;
  }

  // String checking against well-known non-Bhubaneswar cities
  const nonBbsrCities = [
    'delhi', 'mumbai', 'bangalore', 'bengaluru', 'kolkata', 'chennai',
    'hyderabad', 'pune', 'jaipur', 'ahmedabad', 'lucknow', 'chandigarh',
    'patna', 'bhopal', 'indore', 'surat', 'nagpur', 'kochi', 'guwahati'
  ];

  const o = (originQuery || '').toLowerCase();
  const d = (destQuery || '').toLowerCase();

  for (const city of nonBbsrCities) {
    if (o.includes(city) || d.includes(city)) {
      return false;
    }
  }

  return true;
}

export function calculateAreaFareMatrix(
  originName: string,
  destName: string,
  distanceKm = 8.5,
  originCoords?: [number, number] | null,
  destCoords?: [number, number] | null
): AreaFareComparison {
  const isBbsr = isBhubaneswarRegion(originName, destName, originCoords, destCoords);

  // Exact Ama Bus fares from CRUT tariff stages (only for BBSR)
  const acBusFare = isBbsr ? calculateAmaBusAcFare(distanceKm) : Math.round(distanceKm * 2.5);
  const nonAcBusFare = isBbsr ? calculateAmaBusNonAcFare(distanceKm) : Math.round(distanceKm * 1.5);

  const modes: TransitModeFare[] = isBbsr ? [
    {
      mode: 'bus',
      title: 'Ama Bus AC Express (CRUT Stage Fare)',
      category: 'Public Transit',
      fareInr: acBusFare,
      concessionFareInr: Math.max(5, Math.round(acBusFare * 0.5)),
      durationMins: Math.round(distanceKm * 2.4) + 4,
      carbonGrams: 310,
      availability: 'High Frequency (Every 3-5 mins)',
      badge: '❄️ AC Stage Fare',
      color: '#10B981',
      icon: '🚍',
    },
    {
      mode: 'bus',
      title: 'Ama Bus Ordinary (Non-AC / ₹5 Student Pass)',
      category: 'Public Transit',
      fareInr: nonAcBusFare,
      concessionFareInr: 5,
      durationMins: Math.round(distanceKm * 2.7),
      carbonGrams: 260,
      availability: 'Scheduled',
      badge: '🎟️ Official Tariff',
      color: '#3B82F6',
      icon: '🚌',
    },
    {
      mode: 'auto',
      title: 'Auto-Rickshaw / Smart E-Rickshaw',
      category: 'Shared Mobility',
      fareInr: Math.max(30, Math.round(distanceKm * 12) + 20),
      durationMins: Math.round(distanceKm * 2.2),
      carbonGrams: 480,
      availability: 'Available on Stand',
      badge: '🚪 Doorstep Last-Mile',
      color: '#F59E0B',
      icon: '🛺',
    },
    {
      mode: 'cab',
      title: 'Shared Cab / Micro AC Taxi',
      category: 'On-Demand',
      fareInr: Math.max(80, Math.round(distanceKm * 18) + 40),
      durationMins: Math.round(distanceKm * 2.4),
      carbonGrams: 950,
      availability: 'Instant Booking',
      badge: '❄️ Maximum Comfort',
      color: '#EC4899',
      icon: '🚕',
    },
    {
      mode: 'bike',
      title: 'Bike Taxi / E-Scooter Rental',
      category: 'On-Demand',
      fareInr: Math.max(25, Math.round(distanceKm * 7) + 15),
      durationMins: Math.round(distanceKm * 1.9),
      carbonGrams: 280,
      availability: 'Instant Booking',
      badge: '💨 Traffic Buster',
      color: '#06B6D4',
      icon: '🛵',
    },
  ] : [
    {
      mode: 'train',
      title: 'Indian Railways Express (Sleeper / 3AC)',
      category: 'Public Transit',
      fareInr: Math.max(120, Math.round(distanceKm * 0.95)),
      concessionFareInr: Math.max(60, Math.round(distanceKm * 0.5)),
      durationMins: Math.round(distanceKm * 1.1) + 30,
      carbonGrams: 180,
      availability: 'Scheduled',
      badge: '🚆 Best Intercity',
      color: '#3B82F6',
      icon: '🚆',
    },
    {
      mode: 'bus',
      title: 'Intercity State Transport Express (OSRTC / Volvo)',
      category: 'Public Transit',
      fareInr: Math.max(150, Math.round(distanceKm * 1.8)),
      concessionFareInr: Math.max(100, Math.round(distanceKm * 1.2)),
      durationMins: Math.round(distanceKm * 1.3) + 20,
      carbonGrams: 350,
      availability: 'Scheduled',
      badge: '🚌 Highway Express',
      color: '#10B981',
      icon: '🚍',
    },
    {
      mode: 'cab',
      title: 'Outstation Intercity Cab',
      category: 'On-Demand',
      fareInr: Math.max(500, Math.round(distanceKm * 14) + 150),
      durationMins: Math.round(distanceKm * 1.0) + 15,
      carbonGrams: 850,
      availability: 'Instant Booking',
      badge: '🚗 Direct Highway',
      color: '#EC4899',
      icon: '🚕',
    },
    {
      mode: 'ferry',
      title: 'Direct Domestic Flight / Regional Air',
      category: 'On-Demand',
      fareInr: Math.max(2800, Math.round(distanceKm * 4.5)),
      durationMins: Math.min(180, Math.round(distanceKm * 0.15) + 90),
      carbonGrams: 1500,
      availability: 'Scheduled',
      badge: '✈️ Fastest Route',
      color: '#8B5CF6',
      icon: '✈️',
    },
  ];

  return {
    origin: originName,
    destination: destName,
    estimatedDistanceKm: distanceKm,
    modes,
  };
}
