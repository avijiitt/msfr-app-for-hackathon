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

export function calculateAreaFareMatrix(
  originName: string,
  destName: string,
  distanceKm = 8.5
): AreaFareComparison {
  const modes: TransitModeFare[] = [
    {
      mode: 'bus',
      title: 'City Bus (AC Electric / Mo Bus / DTC / BEST)',
      category: 'Public Transit',
      fareInr: Math.max(10, Math.round(distanceKm * 2.2)),
      concessionFareInr: Math.max(5, Math.round(distanceKm * 1.1)),
      durationMins: Math.round(distanceKm * 2.5) + 5,
      carbonGrams: 320,
      availability: 'High Frequency (Every 3-5 mins)',
      badge: '💰 Best Value',
      color: '#10B981',
      icon: '🚍',
    },

    {
      mode: 'train',
      title: 'Suburban Local Train (Fast Passenger)',
      category: 'Public Transit',
      fareInr: Math.max(5, Math.round(distanceKm * 1.0)),
      concessionFareInr: 5,
      durationMins: Math.round(distanceKm * 1.8),
      carbonGrams: 140,
      availability: 'Scheduled',
      badge: '🎟️ Lowest Fare',
      color: '#8B5CF6',
      icon: '🚆',
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
  ];

  return {
    origin: originName,
    destination: destName,
    estimatedDistanceKm: distanceKm,
    modes,
  };
}
