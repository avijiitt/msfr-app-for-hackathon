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
